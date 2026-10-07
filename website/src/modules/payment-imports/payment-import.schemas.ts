import { z } from 'zod';

export const paymentImportBucketSchema = z.string().trim().min(1);
