import { z } from 'zod';

export const Phone = z.object({
	id: z.string(),
	number: z.string(),
	verified: z.boolean(),
	whatsAppActivationStatus: z.string(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const PaymentInformation = z.object({
	id: z.string(),
	provider: z.string(),
	code: z.string(),
	phone: Phone.nullable(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const Contact = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	callingName: z.string().nullable(),
	email: z.string().nullable(),
	gender: z.string().nullable(),
	language: z.string().nullable(),
	dateOfBirth: z.string().nullable(),
	profession: z.string().nullable(),
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
	payoutAmount: z.string(),
	payoutCurrency: z.string(),
	payoutInterval: z.number(),
	totalPayments: z.number(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const Recipient = z.object({
	id: z.string(),
	status: z.string(),
	startDate: z.string().nullable(),
	successorName: z.string().nullable(),
	termsAccepted: z.boolean(),
	contact: Contact,
	program: Program,
	localPartner: LocalPartner,
	paymentInformation: PaymentInformation.nullable(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const Payout = z.object({
	id: z.string(),
	amount: z.string(),
	amountChf: z.string().nullable(),
	currency: z.string(),
	paymentAt: z.string(),
	status: z.string(),
	phoneNumber: z.string().nullable(),
	comments: z.string().nullable(),
	message: z.string().nullable(),
	recipientId: z.string(),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
});

export const Survey = z.object({
	id: z.string(),
	recipientId: z.string(),
	questionnaire: z.string(),
	language: z.string(),
	dueAt: z.string(),
	sentAt: z.string().nullable(),
	completedAt: z.string().nullable(),
	status: z.string(),
	comments: z.string().nullable(),
	data: z.any(),
	accessEmail: z.string(),
	accessPw: z.string(),
	accessToken: z.string(),
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
