const mockUpdateManyAndReturn = jest.fn();
const mockCreateAuditEvents = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		$transaction: (work: (transaction: unknown) => Promise<unknown>) =>
			work({
				recipient: {
					updateManyAndReturn: mockUpdateManyAndReturn,
				},
				auditEvent: {
					findFirst: () => Promise.resolve(null),
					createMany: mockCreateAuditEvents,
				},
			}),
	},
}));

import { defineAuditedEntity } from '@/lib/audit/audited-write';
import { updateUnassignedCandidateAssignments } from './candidate.repository.write';

const recipientEntity = defineAuditedEntity({
	type: 'recipient',
	findSnapshot: (_transaction, id) => Promise.resolve({ programId: `program-of-${id}` }),
	getName: ({ programId }) => `Recipient in ${programId}`,
});

const audit = { actor: { type: 'user' as const, id: 'user-1' }, source: 'portal' as const };

describe('updateUnassignedCandidateAssignments', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns a failure without updating when fewer candidates match than requested', async () => {
		await expect(
			updateUnassignedCandidateAssignments(recipientEntity, audit, ['candidate-1'], 'program-1', 2),
		).resolves.toEqual({
			outcome: 'insufficient',
		});
		expect(mockUpdateManyAndReturn).not.toHaveBeenCalled();
	});

	test('does not keep an assignment when a concurrent request already claimed a selected candidate', async () => {
		mockUpdateManyAndReturn.mockResolvedValue([{ id: 'candidate-1' }]);

		await expect(
			updateUnassignedCandidateAssignments(recipientEntity, audit, ['candidate-1', 'candidate-2'], 'program-1', 2),
		).resolves.toEqual({ outcome: 'insufficient' });
		expect(mockCreateAuditEvents).not.toHaveBeenCalled();
	});

	test('assigns a random subset of still unassigned candidates while leaving startDate unset', async () => {
		mockUpdateManyAndReturn.mockResolvedValue([{ id: 'candidate-2' }]);

		await expect(
			updateUnassignedCandidateAssignments(recipientEntity, audit, ['candidate-1', 'candidate-2'], 'program-1', 1),
		).resolves.toEqual({ outcome: 'assigned', assigned: 1 });
		expect(mockUpdateManyAndReturn).toHaveBeenCalledWith({
			where: { id: { in: [expect.stringMatching(/^candidate-[12]$/)] }, programId: null },
			data: { programId: 'program-1' },
			select: { id: true },
		});
	});

	test('stores a recipient audit event only for the assigned candidates', async () => {
		mockUpdateManyAndReturn.mockResolvedValue([{ id: 'candidate-2' }]);

		await updateUnassignedCandidateAssignments(recipientEntity, audit, ['candidate-1', 'candidate-2'], 'program-1', 1);

		expect(mockCreateAuditEvents).toHaveBeenCalledWith({
			data: [
				expect.objectContaining({
					entityType: 'recipient',
					entityId: 'candidate-2',
					action: 'update',
					actorId: 'user-1',
					entityName: 'Recipient in program-of-candidate-2',
					snapshot: { programId: 'program-of-candidate-2' },
				}),
			],
		});
	});
});
