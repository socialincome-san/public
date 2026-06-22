import { COUNTRY_CODES } from '@/lib/types/country';
import { GENDER_OPTIONS } from '@/lib/types/user';
import * as z from 'zod';

const qrContactSchema = z.object({
	firstName: z.string().trim().min(1),
	lastName: z.string().trim().min(1),
	email: z.string().trim().email(),
});

export type QrContactFields = z.infer<typeof qrContactSchema>;

export const isQrContactValid = (values: QrContactFields): boolean => qrContactSchema.safeParse(values).success;

const [firstCountry, ...restCountries] = COUNTRY_CODES;

const onboardingPersonalSchema = z.object({
	firstname: z.string().trim().min(1),
	lastname: z.string().trim().min(1),
	email: z.string().trim().email(),
	country: z.enum([firstCountry, ...restCountries]),
	gender: z.enum(GENDER_OPTIONS),
});

export type OnboardingPersonalFields = z.infer<typeof onboardingPersonalSchema>;

export const isOnboardingPersonalValid = (values: Partial<OnboardingPersonalFields>): boolean =>
	onboardingPersonalSchema.safeParse(values).success;
