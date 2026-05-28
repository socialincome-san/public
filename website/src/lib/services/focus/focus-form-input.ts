import { SLUG_REGEX } from '@/lib/utils/regex';
import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const focusCreateInputSchema = z.object({
	name: requiredTrimmedString('Name'),
	slug: requiredTrimmedString('Slug').regex(SLUG_REGEX, 'Invalid slug format.'),
});

export const focusUpdateInputSchema = focusCreateInputSchema.extend({
	id: requiredTrimmedString('Focus id'),
});

export type FocusFormCreateInput = z.infer<typeof focusCreateInputSchema>;
export type FocusFormUpdateInput = z.infer<typeof focusUpdateInputSchema>;
