import { z } from 'zod';

export const requestOtpSchema = z.object({
	phoneNumber: z.string(),
});

export const verifyOtpSchema = z.object({
	phoneNumber: z.string(),
	otp: z.string(),
});

export const sessionIdTokenSchema = z.string().min(1, 'missing-id-token');

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
