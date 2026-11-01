import type { FormField } from '@/components/dynamic-form/dynamic-form';
import { CountryCode } from '@/generated/prisma/enums';
import type { CreateOrganizationInput, UpdateOrganizationInput } from '@/modules/organizations/organization.schemas';
import type { OrganizationFormSchema } from './organizations-form';

const toStringArray = (value: FormField['value']): string[] =>
	Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

const toFallbackCountryCode = (value: FormField['value']): CreateOrganizationInput['operatorFallbackCountryCode'] => {
	if (typeof value !== 'string') {
		return 'none';
	}

	return value === 'none' ? value : (Object.values(CountryCode).find((countryCode) => countryCode === value) ?? 'none');
};

export const buildCreateOrganizationInput = (formSchema: OrganizationFormSchema): CreateOrganizationInput => {
	const fields = formSchema.fields;

	return {
		name: typeof fields.name.value === 'string' ? fields.name.value : '',
		operatorFallbackCountryCode: toFallbackCountryCode(fields.operatorFallbackCountryCode.value),
		userIds: toStringArray(fields.users.value),
		ownedProgramIds: toStringArray(fields.ownedPrograms.value),
		operatedProgramIds: toStringArray(fields.operatedPrograms.value),
	};
};

export const buildUpdateOrganizationInput = (
	formSchema: OrganizationFormSchema,
	organizationId: string,
): UpdateOrganizationInput => {
	return {
		id: organizationId,
		...buildCreateOrganizationInput(formSchema),
	};
};
