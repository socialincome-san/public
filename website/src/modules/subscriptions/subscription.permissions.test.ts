import { ProgramPermission } from '@/generated/prisma/enums';
import { canListSubscriptions } from './subscription.permissions';

const operatorAccess = [{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.operator }];
const ownerAccess = [{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.owner }];

describe('subscription permissions', () => {
	test('allows operators to list subscriptions', () => {
		expect(canListSubscriptions(operatorAccess)).toBe(true);
		expect(canListSubscriptions(ownerAccess)).toBe(false);
		expect(canListSubscriptions([])).toBe(false);
	});
});
