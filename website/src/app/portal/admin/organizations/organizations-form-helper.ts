import type { FormField } from '@/components/dynamic-form/dynamic-form';
import type { CreateOrganizationInput, UpdateOrganizationInput } from '@/modules/organizations/organization.schemas';
import type { OrganizationFormSchema } from './organizations-form';

const toStringArray = (value: FormField['value']): string[] =>
	Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

export const buildCreateOrganizationInput = (formSchema: OrganizationFormSchema): CreateOrganizationInput => {
	const fields = formSchema.fields;

	return {
		name: typeof fields.name.value === 'string' ? fields.name.value : '',
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
