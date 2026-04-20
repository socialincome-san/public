import type { FormField } from '@/components/dynamic-form/dynamic-form';
import { PayoutInterval, Profile } from '@/generated/prisma/enums';
import { ProgramSettingsUpdateInput } from '@/lib/services/program/program.types';

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
const PROFILE_VALUES: readonly string[] = Object.values(Profile);

const isPayoutInterval = (value: string): value is PayoutInterval => PAYOUT_INTERVAL_VALUES.includes(value);

const isProfile = (value: string): value is Profile => PROFILE_VALUES.includes(value);

const toPayoutInterval = (value: FormField['value']): PayoutInterval =>
	typeof value === 'string' && isPayoutInterval(value) ? value : PayoutInterval.monthly;

const toFocuses = (value: FormField['value']): string[] =>
	Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

const toProfiles = (value: FormField['value']): Profile[] =>
	Array.isArray(value) ? value.filter((item): item is Profile => typeof item === 'string' && isProfile(item)) : [];

const toStringArray = (value: FormField['value']): string[] =>
	Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

type ProgramSettingsFormFields = {
	name: FormField;
	country: FormField;
	coveredByReserves: FormField;
	programDurationInMonths: FormField;
	payoutPerInterval: FormField;
	payoutInterval: FormField;
	targetFocuses: FormField;
	targetProfiles: FormField;
	ownerOrganizations: FormField;
	operatorOrganizations: FormField;
};

type ProgramSettingsFormInput = {
	fields: ProgramSettingsFormFields;
};

export const buildUpdateProgramSettingsInput = (
	programId: string,
	formSchema: ProgramSettingsFormInput,
): ProgramSettingsUpdateInput => {
	const fields = formSchema.fields;

	return {
		id: programId,
		name: typeof fields.name.value === 'string' ? fields.name.value : '',
		countryId: typeof fields.country.value === 'string' ? fields.country.value : '',
		coveredByReserves: fields.coveredByReserves.value === true,
		programDurationInMonths: toNumber(fields.programDurationInMonths.value),
		payoutPerInterval: toNumber(fields.payoutPerInterval.value),
		payoutInterval: toPayoutInterval(fields.payoutInterval.value),
		targetFocuses: toFocuses(fields.targetFocuses.value),
		targetProfiles: toProfiles(fields.targetProfiles.value),
		ownerOrganizationIds: toStringArray(fields.ownerOrganizations.value),
		operatorOrganizationIds: toStringArray(fields.operatorOrganizations.value),
	};
};
