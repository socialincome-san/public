import type { FormField } from '@/components/dynamic-form/dynamic-form';
import { Cause, PayoutInterval, Profile } from '@/generated/prisma/enums';
import { ProgramSettingsUpdateInput } from '@/lib/services/program/program.types';
import { ProgramSettingsFormSchema } from './program-settings-form';

const toNumber = (value: FormField['value'], fallback = 0): number => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === 'string' && value.trim() !== '') {
		const parsedValue = Number(value);
		if (Number.isFinite(parsedValue)) {
			return parsedValue;
		}
	}

	return fallback;
};

const PAYOUT_INTERVAL_VALUES: readonly string[] = Object.values(PayoutInterval);
const CAUSE_VALUES: readonly string[] = Object.values(Cause);
const PROFILE_VALUES: readonly string[] = Object.values(Profile);

const isPayoutInterval = (value: string): value is PayoutInterval => PAYOUT_INTERVAL_VALUES.includes(value);

const isCause = (value: string): value is Cause => CAUSE_VALUES.includes(value);
const isProfile = (value: string): value is Profile => PROFILE_VALUES.includes(value);

const toPayoutInterval = (value: FormField['value']): PayoutInterval =>
	typeof value === 'string' && isPayoutInterval(value) ? value : PayoutInterval.monthly;

const toCauses = (value: FormField['value']): Cause[] =>
	Array.isArray(value) ? value.filter((item): item is Cause => typeof item === 'string' && isCause(item)) : [];

const toProfiles = (value: FormField['value']): Profile[] =>
	Array.isArray(value) ? value.filter((item): item is Profile => typeof item === 'string' && isProfile(item)) : [];

export const buildUpdateProgramSettingsInput = (
	programId: string,
	formSchema: ProgramSettingsFormSchema,
): ProgramSettingsUpdateInput => {
	const fields = formSchema.fields;

	return {
		id: programId,
		name: typeof fields.name.value === 'string' ? fields.name.value : '',
		countryId: typeof fields.country.value === 'string' ? fields.country.value : '',
		programDurationInMonths: toNumber(fields.programDurationInMonths.value),
		payoutPerInterval: toNumber(fields.payoutPerInterval.value),
		payoutInterval: toPayoutInterval(fields.payoutInterval.value),
		targetCauses: toCauses(fields.targetCauses.value),
		targetProfiles: toProfiles(fields.targetProfiles.value),
	};
};
