import { Cause, ContributorReferralSource, CountryCode, Gender } from '@prisma/client';
import { z } from 'zod';

const addressSchema = z.object({
	country: z
		.nativeEnum(CountryCode)
		.nullable()
		.refine((country) => !!country, { message: 'Required' }),
	street: z.string(),
	number: z.string(),
	city: z.string(),
	zip: z.string(),
});

const contributorSchema = z.object({
	type: z.literal('contributor'),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	language: z.string().optional(),
	gender: z.nativeEnum(Gender).optional(),
	referral: z.nativeEnum(ContributorReferralSource).optional(),
	address: addressSchema,
	newsletter: z.boolean().optional(),
});

const localPartnerSchema = z.object({
	type: z.literal('local-partner'),
	name: z.string().min(1),
	causes: z.array(z.nativeEnum(Cause)).optional(),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	language: z.string().optional(),
	gender: z.nativeEnum(Gender).optional(),
	address: addressSchema,
});

const userSchema = z.object({
	type: z.literal('user'),
	organizationId: z.string().optional(),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	language: z.string().optional(),
	gender: z.nativeEnum(Gender).optional(),
	address: addressSchema,
});

export const profileFormSchema = z.discriminatedUnion('type', [contributorSchema, localPartnerSchema, userSchema]);

export type ProfileFormOutput = z.infer<typeof profileFormSchema>;
export type ProfileFormInput = z.input<typeof profileFormSchema>;
