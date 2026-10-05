import { canCreatePortalProgramDonation } from './stripe-payment.permissions';

describe('canCreatePortalProgramDonation', () => {
	test('allows donation when the program is accessible', () => {
		expect(canCreatePortalProgramDonation([{ programId: 'program-1' }, { programId: 'program-2' }], 'program-2')).toBe(true);
	});

	test('denies donation when the program is not accessible', () => {
		expect(canCreatePortalProgramDonation([{ programId: 'program-1' }], 'program-2')).toBe(false);
	});
});
