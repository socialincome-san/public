import { ProgramPermission } from '@/generated/prisma/enums';
import {
	canCreateContributor,
	canListContributors,
	canReadContributor,
	canUpdateContributor,
} from './contributor.permissions';

const operatorAccess = [{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.operator }];
const ownerAccess = [{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.owner }];

describe('contributor permissions', () => {
	test('allows operators to create and list contributors', () => {
		expect(canCreateContributor(operatorAccess)).toBe(true);
		expect(canListContributors(operatorAccess)).toBe(true);
		expect(canCreateContributor(ownerAccess)).toBe(false);
		expect(canListContributors([])).toBe(false);
	});

	test('allows any program access to read contributors', () => {
		expect(canReadContributor(ownerAccess)).toBe(true);
		expect(canReadContributor([])).toBe(false);
	});

	test('allows operators to update contributors without contributions', () => {
		expect(canUpdateContributor(operatorAccess, [])).toBe(true);
		expect(canUpdateContributor(ownerAccess, [])).toBe(false);
	});

	test('requires operator access on a contributor program when contributions exist', () => {
		expect(canUpdateContributor(operatorAccess, ['program-1'])).toBe(true);
		expect(canUpdateContributor(operatorAccess, ['program-2'])).toBe(false);
	});
});
