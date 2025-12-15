import { z } from 'zod';

const Phone = z.object({
	id: z.string(),
	number: z.string(),
	hasWhatsApp: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const PaymentInformation = z.object({
	id: z.string(),
	provider: z.string(),
	code: z.string(),
	phoneId: z.string(),
	phone: Phone,
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const Contact = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	callingName: z.string().nullable(),
	addressId: z.string().nullable(),
	phoneId: z.string().nullable(),
	phone: Phone.nullable(),
	email: z.string().nullable(),
	gender: z.string().nullable(),
	language: z.string().nullable(),
	dateOfBirth: z.string().nullable(),
	profession: z.string().nullable(),
	isInstitution: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const LocalPartner = z.object({
	id: z.string(),
	name: z.string(),
	contact: Contact,
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const Program = z.object({
	id: z.string(),
	name: z.string(),
	country: z.string(),
	payoutAmount: z.number(),
	payoutCurrency: z.string(),
	payoutInterval: z.enum(['monthly', 'quarterly', 'yearly']),
	totalPayments: z.number(),
	ownerOrganizationId: z.string(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const Recipient = z.object({
	id: z.string(),
	contactId: z.string(),
	status: z.string(),
	startDate: z.string().nullable(),
	successorName: z.string().nullable(),
	termsAccepted: z.boolean(),
	paymentInformationId: z.string().nullable(),
	programId: z.string(),
	localPartnerId: z.string(),
	contact: Contact,
	program: Program,
	localPartner: LocalPartner,
	paymentInformation: PaymentInformation.nullable(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const Payout = z.object({
	id: z.string(),
	amount: z.number(),
	amountChf: z.number().nullable(),
	currency: z.string(),
	paymentAt: z.string(),
	status: z.string(),
	phoneNumber: z.string().nullable(),
	comments: z.string().nullable(),
	recipientId: z.string(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const PayoutListResponse = z.array(Payout);

const Survey = z.object({
	id: z.string(),
	name: z.string(),
	recipientId: z.string(),
	questionnaire: z.string(),
	language: z.string(),
	dueAt: z.string(),
	completedAt: z.string().nullable(),
	status: z.string(),
	data: z.any(),
	accessEmail: z.string(),
	accessPw: z.string(),
	accessToken: z.string(),
	surveyScheduleId: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const SurveyListResponse = z.array(Survey);

export const RecipientSelfUpdate = z.object({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	callingName: z.string().optional(),
	gender: z.enum(['male', 'female', 'other', 'private']).optional(),
	dateOfBirth: z.string().optional(),
	language: z.string().optional(),
	email: z.string().email().optional(),
	contactPhone: z.string().optional(),
	paymentPhone: z.string().optional(),
	paymentProvider: z.enum(['orange_money']).optional(),
	successorName: z.string().optional(),
});

const PayoutParams = z.object({
	payoutId: z.string().describe('Payout ID'),
});

export const VerifyOtpRequest = z.object({
	phoneNumber: z.string(),
	otp: z.string(),
});

const VerifyOtpResponse = z.object({
	customToken: z.string(),
	isNewUser: z.boolean(),
	uid: z.string(),
});

const StripeWebhookResponse = z.object({
	received: z.literal(true),
	data: z
		.object({
			contributionId: z.string().optional(),
			contributorId: z.string().optional(),
			isNewContributor: z.boolean().optional(),
		})
		.optional(),
});

const ErrorResponse = z.object({
	error: z.string(),
});

const PaymentFilesImportResult = z.object({
	id: z.string(),
	contributionId: z.string(),
	type: z.string(),
	transactionId: z.string(),
	metadata: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
});

const ExchangeRatesImportSuccess = z.object({
	success: z.literal(true),
});
