import type { FormField } from '@/components/dynamic-form/dynamic-form';
import type { OrganizationFormCreateInput, OrganizationFormUpdateInput } from '@/lib/services/organization/organization-form-input';
import type { OrganizationFormSchema } from './organizations-form';

const toStringArray = (value: FormField['value']): string[] =>
	Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

export const buildCreateOrganizationInput = (formSchema: OrganizationFormSchema): OrganizationFormCreateInput => {
	const fields = formSchema.fields;

	return {
		name: typeof fields.name.value === 'string' ? fields.name.value : '',
		editUserIds: toStringArray(fields.editUsers.value),
		readonlyUserIds: toStringArray(fields.readonlyUsers.value),
		ownedProgramIds: toStringArray(fields.ownedPrograms.value),
		operatedProgramIds: toStringArray(fields.operatedPrograms.value),
	};
};

export const buildUpdateOrganizationInput = (
	formSchema: OrganizationFormSchema,
	organizationId: string,
): OrganizationFormUpdateInput => {
	return {
		id: organizationId,
		...buildCreateOrganizationInput(formSchema),
	};
};
