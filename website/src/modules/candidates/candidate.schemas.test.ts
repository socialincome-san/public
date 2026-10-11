import { candidateCreateSchema, candidateUpdateSchema } from './candidate.schemas';

const validInput = {
	suspendedAt: null,
	suspensionReason: null,
	successorName: null,
	termsAccepted: false,
	localPartnerId: 'partner-1',
	contact: {
		firstName: 'Jane',
		lastName: 'Doe',
		callingName: null,
		email: null,
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
	paymentInformation: {
		mobileMoneyProviderId: '',
		code: null,
		phone: '',
	},
};

describe('candidate schemas', () => {
	test('normalizes optional phone and provider fields', () => {
		expect(candidateCreateSchema.parse(validInput)).toMatchObject({
			contact: { phone: undefined },
			paymentInformation: {
				mobileMoneyProviderId: undefined,
				phone: undefined,
			},
		});
	});

	test('requires an id for updates', () => {
		expect(candidateUpdateSchema.safeParse(validInput).success).toBe(false);
	});
});
