import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const focusCreateInputSchema = z.object({
	name: requiredTrimmedString('Name'),
});

export const focusUpdateInputSchema = focusCreateInputSchema.extend({
	id: requiredTrimmedString('Focus id'),
});

export type FocusFormCreateInput = z.infer<typeof focusCreateInputSchema>;
export type FocusFormUpdateInput = z.infer<typeof focusUpdateInputSchema>;
