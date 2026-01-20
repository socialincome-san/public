import { Cause, ContributorReferralSource, Gender } from '@prisma/client';
import { z } from 'zod';

const contributorSchema = z.object({
	type: z.literal('contributor'),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	country: z.string().optional(),
	language: z.string().optional(),
	gender: z.nativeEnum(Gender).optional(),
	referral: z.nativeEnum(ContributorReferralSource).optional(),
	street: z.string().optional(),
	number: z.string().optional(),
	city: z.string().optional(),
	zip: z.string().optional(),
	newsletter: z.boolean().optional(),
});

const localPartnerSchema = z.object({
	type: z.literal('local-partner'),
	name: z.string().min(1),
	causes: z.array(z.nativeEnum(Cause)).optional(),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	country: z.string().optional(),
	language: z.string().optional(),
	gender: z.nativeEnum(Gender).optional(),
	street: z.string().optional(),
	number: z.string().optional(),
	city: z.string().optional(),
	zip: z.string().optional(),
});

const userSchema = z.object({
	type: z.literal('user'),
	organizationId: z.string().optional(),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	country: z.string().optional(),
	language: z.string().optional(),
	gender: z.nativeEnum(Gender).optional(),
	street: z.string().optional(),
	number: z.string().optional(),
	city: z.string().optional(),
	zip: z.string().optional(),
});

export const profileFormSchema = z.discriminatedUnion('type', [contributorSchema, localPartnerSchema, userSchema]);

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
