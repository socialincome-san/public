const mockCreateAuditEvents = jest.fn();
const mockDeleteAccesses = jest.fn();
const mockCreateAccesses = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		$transaction: (work: (transaction: unknown) => Promise<unknown>) =>
			work({
				programAccess: {
					findMany: () => Promise.resolve([{ programId: 'program-old' }, { programId: 'program-1' }]),
					deleteMany: mockDeleteAccesses,
					createMany: mockCreateAccesses,
				},
				program: {
					findUnique: ({ where }: { where: { id: string } }) => Promise.resolve({ name: `Name of ${where.id}` }),
				},
				auditEvent: {
					findFirst: () => Promise.resolve(null),
					createMany: mockCreateAuditEvents,
				},
			}),
	},
}));

import { ProgramPermission } from '@/generated/prisma/enums';
import { updateOrganizationProgramAccesses } from './program.repository.write';

const audit = { actor: { type: 'user' as const, id: 'admin-1' }, source: 'portal' as const };

describe('updateOrganizationProgramAccesses', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('replaces the accesses and stores an event for every previously and newly accessed program', async () => {
		await updateOrganizationProgramAccesses(audit, {
			organizationId: 'organization-1',
			ownedProgramIds: ['program-1'],
			operatedProgramIds: ['program-new'],
		});

		expect(mockDeleteAccesses).toHaveBeenCalledWith({ where: { organizationId: 'organization-1' } });
		expect(mockCreateAccesses).toHaveBeenCalledWith({
			data: [
				{ programId: 'program-1', permission: ProgramPermission.owner, organizationId: 'organization-1' },
				{ programId: 'program-new', permission: ProgramPermission.operator, organizationId: 'organization-1' },
			],
		});
		expect(mockCreateAuditEvents).toHaveBeenCalledWith({
			data: ['program-old', 'program-1', 'program-new'].map((entityId): unknown =>
				expect.objectContaining({ entityType: 'program', entityId, entityName: `Name of ${entityId}` }),
			),
		});
	});
});
