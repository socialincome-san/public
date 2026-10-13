const mockIsAdmin = jest.fn();
const mockFindCandidateById = jest.fn();
const mockCountCandidates = jest.fn();
const mockUpdateCandidateProgramAssignments = jest.fn();
const mockDeleteCandidateData = jest.fn();
const mockCandidatePrograms = new Map<string, string | null>();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('@/modules/countries/country.service', () => ({
	getCountryIsoCode: jest.fn(),
}));

jest.mock('@/modules/auth/auth.service', () => ({}));
jest.mock('@/lib/database/audited-transaction', () => jest.requireActual<object>('@/lib/audit/audited-transaction.fake'));
jest.mock('@/modules/recipients/recipient.service', () => ({
	recipientAuditEntity: {
		type: 'recipient',
		fields: { programId: 'plain' },
		findSnapshots: (_transaction: unknown, ids: string[]) =>
			Promise.resolve(
				ids.flatMap((id) => (mockCandidatePrograms.has(id) ? [{ id, programId: mockCandidatePrograms.get(id) }] : [])),
			),
	},
}));

jest.mock('./candidate.repository', () => ({
	findCandidateById: mockFindCandidateById,
	countCandidates: mockCountCandidates,
	findCandidateIdsForAssignment: () => Promise.resolve([{ id: 'candidate-1' }, { id: 'candidate-2' }]),
	updateCandidateProgramAssignments: mockUpdateCandidateProgramAssignments,
	findCandidateForDeletion: (id: string) =>
		Promise.resolve({
			id,
			contactId: 'contact-1',
			paymentInformationId: null,
			programId: null,
			localPartnerId: 'partner-1',
			contact: { phoneId: null, addressId: null },
			paymentInformation: null,
		}),
	deleteCandidateData: mockDeleteCandidateData,
}));

import { auditLog } from '@/lib/audit/audited-transaction.fake';
import { assignRandomCandidatesToProgram, deleteCandidate, getCandidate, getCandidateCount } from './candidate.service';

describe('candidate service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
	});

	test('rejects a local partner reading another partners candidate', async () => {
		mockFindCandidateById.mockResolvedValue({
			id: 'candidate-1',
			programId: null,
			localPartnerId: 'partner-2',
		});

		await expect(
			getCandidate(
				{
					type: 'local-partner',
					id: 'partner-1',
					name: 'Partner',
					focuses: [],
					gender: null,
					email: null,
					firstName: null,
					lastName: null,
					language: null,
					street: null,
					number: null,
					city: null,
					zip: null,
					country: null,
				},
				'candidate-1',
			),
		).resolves.toEqual({
			success: false,
			error: 'Permission denied',
			status: undefined,
		});
	});

	test('returns the unfiltered candidate count', async () => {
		mockCountCandidates.mockResolvedValue(12);

		await expect(getCandidateCount([], [], null)).resolves.toEqual({
			success: true,
			data: { count: 12 },
			status: undefined,
		});
	});
});

describe('candidate audit trail', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		auditLog.reset();
		mockCandidatePrograms.clear();
		mockCandidatePrograms.set('candidate-1', null);
		mockCandidatePrograms.set('candidate-2', null);
	});

	test('records one program assignment event per assigned candidate', async () => {
		mockUpdateCandidateProgramAssignments.mockImplementation((_transaction: unknown, ids: string[], programId: string) => {
			ids.forEach((id) => mockCandidatePrograms.set(id, programId));

			return Promise.resolve({ count: ids.length });
		});

		const result = await assignRandomCandidatesToProgram(
			{ actor: { type: 'user', id: 'user-1' }, source: 'website' },
			'program-1',
			2,
			'SL',
		);

		expect(result).toEqual({ success: true, data: { assigned: 2 }, status: undefined });
		expect(
			auditLog.committed.map(({ entityId, actor, source, changes, metadata }) => ({
				entityId,
				actor,
				source,
				changes,
				metadata,
			})),
		).toEqual(
			expect.arrayContaining(
				['candidate-1', 'candidate-2'].map((entityId) => ({
					entityId,
					actor: { type: 'user', id: 'user-1' },
					source: 'website',
					changes: [{ path: 'programId', old: null, new: 'program-1' }],
					metadata: { operation: 'random-candidate-assignment' },
				})),
			),
		);
	});

	test('records a local partner deleting their candidate', async () => {
		mockDeleteCandidateData.mockImplementation(() => Promise.resolve(mockCandidatePrograms.delete('candidate-1')));

		const result = await deleteCandidate(
			{
				type: 'local-partner',
				id: 'partner-1',
				name: 'Partner',
				focuses: [],
				gender: null,
				email: null,
				firstName: null,
				lastName: null,
				language: null,
				street: null,
				number: null,
				city: null,
				zip: null,
				country: null,
			},
			'candidate-1',
		);

		expect(result.success).toBe(true);
		expect(auditLog.committed).toMatchObject([
			{
				action: 'delete',
				entityId: 'candidate-1',
				actor: { type: 'local-partner', id: 'partner-1' },
				source: 'partner-space',
			},
		]);
	});
});
