import { ProgramPermission } from '@/generated/prisma/enums';
import {
	canCreateRecipient,
	canReadRecipient,
	canReadRecipientAuditTrail,
	canRemoveRecipientFromProgram,
	canUpdateRecipient,
} from './recipient.permissions';

const operatorAccess = [
	{
		programId: 'program-1',
		programName: 'Program 1',
		permission: ProgramPermission.operator,
	},
];

describe('recipient permissions', () => {
	test('requires operator access when a user creates a recipient', () => {
		expect(canCreateRecipient({ type: 'user', id: 'user-1' }, 'program-1', operatorAccess)).toBe(true);
		expect(canCreateRecipient({ type: 'user', id: 'user-1' }, 'program-2', operatorAccess)).toBe(false);
	});

	test('allows local partners to create only in programs where they already have a recipient', () => {
		expect(canCreateRecipient({ type: 'local-partner', id: 'partner-1' }, 'program-a', [], true)).toBe(true);
		expect(canCreateRecipient({ type: 'local-partner', id: 'partner-1' }, 'program-b', [], false)).toBe(false);
	});

	test('denies non-operator users even when a partner eligibility flag is true', () => {
		expect(canCreateRecipient({ type: 'user', id: 'user-1' }, 'program-2', operatorAccess, true)).toBe(false);
	});

	test('restricts local partners to their own recipients', () => {
		expect(
			canReadRecipient(
				{ type: 'local-partner', id: 'partner-1' },
				{ programId: 'program-1', localPartnerId: 'partner-1' },
				[],
			),
		).toBe(true);
		expect(
			canReadRecipient(
				{ type: 'local-partner', id: 'partner-1' },
				{ programId: 'program-1', localPartnerId: 'partner-2' },
				[],
			),
		).toBe(false);
	});

	test('checks both current and requested programs when a user updates a recipient', () => {
		const recipient = { programId: 'program-1', localPartnerId: 'partner-1' };

		expect(canUpdateRecipient({ type: 'user', id: 'user-1' }, recipient, undefined, operatorAccess)).toBe(true);
		expect(canUpdateRecipient({ type: 'user', id: 'user-1' }, recipient, 'program-2', operatorAccess)).toBe(false);
	});

	test('only allows users with operator access to remove a recipient from a program', () => {
		expect(canRemoveRecipientFromProgram({ type: 'user', id: 'user-1' }, 'program-1', operatorAccess)).toBe(true);
		expect(canRemoveRecipientFromProgram({ type: 'local-partner', id: 'partner-1' }, 'program-1', operatorAccess)).toBe(
			false,
		);
	});

	test('limits audit trails of candidates and deleted recipients to admins and owning partners', () => {
		const user = { type: 'user' as const, id: 'user-1' };
		const partner = { type: 'local-partner' as const, id: 'partner-1' };
		const candidate = { programId: null, localPartnerId: 'partner-1' };

		expect(
			canReadRecipientAuditTrail(user, { programId: 'program-1', localPartnerId: 'partner-1' }, operatorAccess, false),
		).toBe(true);
		expect(canReadRecipientAuditTrail(user, candidate, operatorAccess, false)).toBe(false);
		expect(canReadRecipientAuditTrail(user, candidate, [], true)).toBe(true);
		expect(canReadRecipientAuditTrail(partner, candidate, [], false)).toBe(true);
		expect(canReadRecipientAuditTrail(user, null, operatorAccess, false)).toBe(false);
		expect(canReadRecipientAuditTrail(user, null, [], true)).toBe(true);
		expect(canReadRecipientAuditTrail(partner, null, [], false)).toBe(false);
	});
});
