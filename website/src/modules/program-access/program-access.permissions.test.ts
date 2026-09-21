import { ProgramPermission } from '@/generated/prisma/enums';
import { hasAnyOperatorAccess, hasOperatorAccess } from './program-access.permissions';
import type { ProgramAccesses } from './program-access.types';

const accesses: ProgramAccesses = [
	{
		programId: 'owned-program',
		programName: 'Owned Program',
		permission: ProgramPermission.owner,
	},
	{
		programId: 'operated-program',
		programName: 'Operated Program',
		permission: ProgramPermission.operator,
	},
];

describe('program access permissions', () => {
	test('grants operator access only for explicitly operated programs', () => {
		expect(hasOperatorAccess(accesses, 'operated-program')).toBe(true);
		expect(hasOperatorAccess(accesses, 'owned-program')).toBe(false);
		expect(hasOperatorAccess(accesses, 'missing-program')).toBe(false);
	});

	test('detects whether any operator access exists', () => {
		expect(hasAnyOperatorAccess(accesses)).toBe(true);
		expect(hasAnyOperatorAccess(accesses.slice(0, 1))).toBe(false);
		expect(hasAnyOperatorAccess([])).toBe(false);
	});
});
