import { ProgramPermission } from '@/generated/prisma/enums';
import { canListContributions, canReadContribution, canWriteContribution } from './contribution.permissions';

const operatorAccess = [{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.operator }];
const ownerAccess = [{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.owner }];

describe('contribution permissions', () => {
	test('allows any program access to read contributions for that program', () => {
		expect(canReadContribution(ownerAccess, 'program-1')).toBe(true);
		expect(canReadContribution(operatorAccess, 'program-1')).toBe(true);
		expect(canReadContribution(operatorAccess, 'program-2')).toBe(false);
		expect(canReadContribution([], 'program-1')).toBe(false);
	});

	test('allows operators to list contributions', () => {
		expect(canListContributions(operatorAccess)).toBe(true);
		expect(canListContributions(ownerAccess)).toBe(false);
		expect(canListContributions([])).toBe(false);
	});

	test('requires operator access on the campaign program to write contributions', () => {
		expect(canWriteContribution(operatorAccess, 'program-1')).toBe(true);
		expect(canWriteContribution(ownerAccess, 'program-1')).toBe(false);
		expect(canWriteContribution(operatorAccess, 'program-2')).toBe(false);
	});
});
