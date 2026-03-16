import { UserRole } from '@/generated/prisma/enums';
import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const userCreateInputSchema = z.object({
	firstName: requiredTrimmedString('First name'),
	lastName: requiredTrimmedString('Last name'),
	email: z.string().trim().email('Please provide a valid email address.'),
	role: z.nativeEnum(UserRole),
	organizationId: requiredTrimmedString('Organization'),
});

export const userUpdateInputSchema = userCreateInputSchema.extend({
	id: requiredTrimmedString('User id'),
});

export type UserFormCreateInput = z.infer<typeof userCreateInputSchema>;
export type UserFormUpdateInput = z.infer<typeof userUpdateInputSchema>;
