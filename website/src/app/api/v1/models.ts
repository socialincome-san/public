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
	mobileMoneyProvider: z.object({ id: z.string(), name: z.string() }).nullable(),
	mobileMoneyProviderId: z.string().nullable().optional(),
	code: z.string().nullable(),
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
	gender: z.enum(['male', 'female', 'other', 'private']).nullable(),
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

const Country = z.object({
	isoCode: z.string(),
});

const Program = z.object({
	id: z.string(),
	name: z.string(),
	countryId: z.string(),
	country: Country,
	payoutPerInterval: z.union([z.number(), z.string()]),
	payoutCurrency: z.string(),
	payoutInterval: z.enum(['monthly', 'quarterly', 'yearly']),
	programDurationInMonths: z.number(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const Recipient = z.object({
	id: z.string(),
	contactId: z.string(),
	suspendedAt: z.string().nullable(),
	suspensionReason: z.string().nullable(),
	startDate: z.string().nullable(),
	successorName: z.string().nullable(),
	termsAccepted: z.boolean(),
	paymentInformationId: z.string().nullable(),
	programId: z.string().nullable(),
	localPartnerId: z.string(),
	contact: Contact,
	program: Program.nullable(),
	localPartner: LocalPartner,
	paymentInformation: PaymentInformation.nullable(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

const Payout = z.object({
	id: z.string(),
	amount: z.union([z.number(), z.string()]),
	amountChf: z.union([z.number(), z.string()]).nullable(),
	currency: z.string(),
	paymentAt: z.string(),
	status: z.enum(['paid', 'confirmed', 'contested', 'failed']),
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
	questionnaire: z.enum(['onboarding', 'checkin', 'offboarding', 'offboarded_checkin']),
	language: z.string(),
	dueAt: z.string(),
	completedAt: z.string().nullable(),
	status: z.enum(['new', 'sent', 'scheduled', 'in_progress', 'completed', 'missed']),
	data: z.any(),
	accessEmail: z.string(),
	accessPw: z.string(),
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
	termsAccepted: z.boolean().optional(),
	contactPhone: z.string().nullable().optional(),
	paymentPhone: z.string().optional(),
	paymentProvider: z.string().optional(),
	successorName: z.string().optional(),
});

const PayoutParams = z.object({
	payoutId: z.string().describe('Payout ID'),
});

export const ContestPayoutBody = z.object({
	comments: z.string().optional().nullable(),
});

export const ConfirmPayoutBody = z.object({
	comments: z.string().optional().nullable(),
});

export const VerifyOtpRequest = z.object({
	phoneNumber: z.string(),
	otp: z.string(),
});

export const RequestOtpRequest = z.object({
	phoneNumber: z.string(),
});

const VerifyOtpResponse = z.object({
	customToken: z.string(),
	isNewUser: z.boolean(),
	uid: z.string(),
});
