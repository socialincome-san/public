import { z } from 'zod';

export const Phone = z.object({
	id: z.string(),
	number: z.string(),
	hasWhatsApp: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const PaymentInformation = z.object({
	id: z.string(),
	provider: z.string(),
	code: z.string(),
	phoneId: z.string(),
	phone: Phone,
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const Contact = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	callingName: z.string().nullable(),
	addressId: z.string().nullable(),
	phoneId: z.string().nullable(),
	email: z.string().nullable(),
	gender: z.string().nullable(),
	language: z.string().nullable(),
	dateOfBirth: z.string().nullable(),
	profession: z.string().nullable(),
	isInstitution: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const LocalPartner = z.object({
	id: z.string(),
	name: z.string(),
	contact: Contact,
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const Program = z.object({
	id: z.string(),
	name: z.string(),
	country: z.string(),
	payoutAmount: z.number(),
	payoutCurrency: z.string(),
	payoutInterval: z.number(),
	totalPayments: z.number(),
	ownerOrganizationId: z.string(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const Recipient = z.object({
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

export const Payout = z.object({
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

export const Survey = z.object({
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

export const RecipientUpdate = z
	.object({
		firstName: z.string().min(1).optional(),
		lastName: z.string().min(1).optional(),
	})
	.refine((d) => d.firstName || d.lastName, {
		message: 'Provide at least one field: firstName or lastName',
	});

export const VerifyOtpRequest = z.object({
	phoneNumber: z.string(),
	otp: z.string(),
});

export const VerifyOtpResponse = z.object({
	success: z.literal(true),
	token: z.string(),
	isNewUser: z.boolean(),
	uid: z.string(),
});

export const StripeWebhookResponse = z.object({
	received: z.literal(true),
	data: z
		.object({
			contributionId: z.string().optional(),
			contributorId: z.string().optional(),
			isNewContributor: z.boolean().optional(),
		})
		.optional(),
});

export const StripeWebhookError = z.object({
	error: z.string(),
});

export const PaymentFilesImportResult = z.object({
	id: z.string(),
	contributionId: z.string(),
	type: z.string(),
	transactionId: z.string(),
	metadata: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
});

export const PaymentFilesImportError = z.object({
	error: z.string(),
});
