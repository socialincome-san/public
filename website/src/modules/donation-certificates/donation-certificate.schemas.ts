import { tableQueryFilterSchema, tableQuerySchema } from '@/lib/table-query-schema';
import { LANGUAGE_CODES } from '@/lib/types/language';
import { z } from 'zod';

const yearSchema = z.number().int();
const languageSchema = z.enum(LANGUAGE_CODES).optional();

export const donationCertificateTableQuerySchema = tableQuerySchema.extend({
	contributorId: tableQueryFilterSchema,
});

export const donationCertificateIdSchema = z.string().trim().min(1).max(128);

export const donationCertificateBatchCreateSchema = z.object({
	year: yearSchema,
	contributorIds: z.array(z.string().trim().min(1)),
	language: languageSchema,
});

export const donationCertificateCreateSchema = z.object({
	year: yearSchema,
	language: languageSchema,
});
