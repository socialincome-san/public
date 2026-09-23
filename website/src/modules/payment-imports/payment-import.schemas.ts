import { z } from 'zod';

export const paymentImportRequestSchema = z.object({
	apiKey: z.string().min(1),
});

export const paymentImportBucketSchema = z.string().trim().min(1);
