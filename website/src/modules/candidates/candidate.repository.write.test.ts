const mockQueryRaw = jest.fn<Promise<{ id: string }[]>, [TemplateStringsArray, ...unknown[]]>();
const mockCreateAuditEvents = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		$transaction: (work: (transaction: unknown) => Promise<unknown>) =>
			work({
				$queryRaw: mockQueryRaw,
				recipient: {
					findUnique: ({ where }: { where: { id: string } }) => Promise.resolve({ programId: `program-of-${where.id}` }),
				},
				auditEvent: {
					findFirst: () => Promise.resolve(null),
					createMany: mockCreateAuditEvents,
				},
			}),
	},
}));

import { updateUnassignedCandidateAssignments } from './candidate.repository.write';

const audit = { actor: { type: 'user' as const, id: 'user-1' }, source: 'portal' as const };

describe('updateUnassignedCandidateAssignments', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns a failure without updating when fewer candidates match than requested', async () => {
		await expect(updateUnassignedCandidateAssignments(audit, ['candidate-1'], 'program-1', 2)).resolves.toEqual({
			outcome: 'insufficient',
		});
		expect(mockQueryRaw).not.toHaveBeenCalled();
	});

	test('does not keep an assignment when a concurrent request already claimed a selected candidate', async () => {
		mockQueryRaw.mockResolvedValue([{ id: 'candidate-1' }]);

		await expect(
			updateUnassignedCandidateAssignments(audit, ['candidate-1', 'candidate-2'], 'program-1', 2),
		).resolves.toEqual({ outcome: 'insufficient' });
		expect(mockCreateAuditEvents).not.toHaveBeenCalled();
	});

	test('assigns a random subset of unclaimed candidates while leaving startDate unset', async () => {
		mockQueryRaw.mockResolvedValue([{ id: 'candidate-2' }]);

		await expect(
			updateUnassignedCandidateAssignments(audit, ['candidate-1', 'candidate-2'], 'program-1', 1),
		).resolves.toEqual({ outcome: 'assigned', assigned: 1 });
		const [strings, ...values] = mockQueryRaw.mock.calls[0] ?? [];
		const sql = strings?.join('?') ?? '';
		expect(sql).toContain('program_id IS NULL');
		expect(sql).toContain('FOR UPDATE SKIP LOCKED');
		expect(sql).toContain('RETURNING id');
		expect(sql).not.toContain('start_date');
		expect(values).toEqual(['program-1', ['candidate-1', 'candidate-2'], 1]);
	});

	test('stores a recipient audit event only for the assigned candidates', async () => {
		mockQueryRaw.mockResolvedValue([{ id: 'candidate-2' }]);

		await updateUnassignedCandidateAssignments(audit, ['candidate-1', 'candidate-2'], 'program-1', 1);

		expect(mockCreateAuditEvents).toHaveBeenCalledWith({
			data: [
				expect.objectContaining({
					entityType: 'recipient',
					entityId: 'candidate-2',
					action: 'update',
					actorId: 'user-1',
					snapshot: { programId: 'program-of-candidate-2' },
				}),
			],
		});
	});
});
