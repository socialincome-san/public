import { Cause, PayoutInterval, Profile } from '@/generated/prisma/enums';
import z from 'zod';

const positiveInteger = z.preprocess(
	(value) => {
		if (typeof value === 'string') {
			return Number(value);
		}

		return value;
	},
	z.number().int().min(1, 'Program duration must be at least 1 month.'),
);

const positiveNumber = z.preprocess((value) => {
	if (typeof value === 'string') {
		return Number(value);
	}

	return value;
}, z.number().positive('Payout per interval must be greater than 0.'));

export const programSettingsUpdateInputSchema = z.object({
	id: z.string().trim().min(1, 'Program id is required.'),
	name: z.string().trim().min(2, 'Program name must be at least 2 characters.'),
	countryId: z.string().trim().min(1, 'Country is required.'),
	programDurationInMonths: positiveInteger,
	payoutPerInterval: positiveNumber,
	payoutInterval: z.nativeEnum(PayoutInterval),
	targetCauses: z.array(z.nativeEnum(Cause)).default([]),
	targetProfiles: z.array(z.nativeEnum(Profile)).default([]),
});

export type ProgramSettingsFormUpdateInput = z.infer<typeof programSettingsUpdateInputSchema>;
