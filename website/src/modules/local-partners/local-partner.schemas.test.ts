import { localPartnerCreateSchema, localPartnerUpdateSchema } from './local-partner.schemas';

const validInput = {
	name: ' Partner ',
	slug: 'partner',
	focuses: [],
	contact: {
		firstName: 'Jane',
		lastName: 'Doe',
		callingName: null,
		email: 'jane@example.org',
		gender: null,
		language: null,
		dateOfBirth: null,
		profession: null,
		phone: '',
		hasWhatsApp: false,
		street: null,
		number: null,
		city: null,
		zip: null,
		country: null,
	},
};

describe('local partner schemas', () => {
	test('normalizes create input', () => {
		expect(localPartnerCreateSchema.parse(validInput)).toMatchObject({
			name: 'Partner',
			contact: { phone: undefined },
		});
	});

	test('accepts a missing id for local-partner self updates', () => {
		expect(localPartnerUpdateSchema.safeParse(validInput).success).toBe(true);
	});
});
