'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { cloneFormSchema } from '@/components/dynamic-form/helper';
import {
	createOrganizationAction,
	deleteOrganizationAction,
	getOrganizationAction,
	getOrganizationProgramOptionsAction,
	getOrganizationUserOptionsAction,
	updateOrganizationAction,
} from '@/lib/server-actions/organization-action';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { OrganizationPayload } from '@/lib/services/organization/organization.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateOrganizationInput, buildUpdateOrganizationInput } from './organizations-form-helper';

type OrganizationFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	organizationId?: string;
};

export type OrganizationFormSchema = {
	label: string;
	fields: {
		name: FormField;
		users: FormField;
		ownedPrograms: FormField;
		operatedPrograms: FormField;
	};
};

const initialFormSchema: OrganizationFormSchema = {
	label: 'Organization',
	fields: {
		name: {
			placeholder: 'Organization name',
			label: 'Name',
			zodSchema: z.string().trim().min(1, 'Organization name is required.'),
		},
		users: {
			label: 'Users',
			placeholder: 'Select users',
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
		ownedPrograms: {
			label: 'Owned programs',
			placeholder: 'Select owned programs',
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
		operatedPrograms: {
			label: 'Operated programs',
			placeholder: 'Select operated programs',
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
	},
};

export default function OrganizationsForm({ onSuccess, onError, onCancel, organizationId }: OrganizationFormProps) {
	const [formSchema, setFormSchema] = useState<OrganizationFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [organization, setOrganization] = useState<OrganizationPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: OrganizationFormSchema) => {
		startTransition(async () => {
			const result =
				organizationId && organization
					? await updateOrganizationAction(buildUpdateOrganizationInput(schema, organization.id))
					: await createOrganizationAction(buildCreateOrganizationInput(schema));
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete = () => {
		if (!organizationId) {
			return;
		}

		startTransition(async () => {
			const result = await deleteOrganizationAction(organizationId);
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		startTransition(async () => {
			try {
				const [organizationResult, usersResult, programsResult] = await Promise.all([
					organizationId ? getOrganizationAction(organizationId) : Promise.resolve(null),
					getOrganizationUserOptionsAction(),
					getOrganizationProgramOptionsAction(),
				]);

				if (organizationId && organizationResult?.success) {
					setOrganization(organizationResult.data);
				}

				setFormSchema(() => {
					const next = cloneFormSchema(initialFormSchema);
					if (usersResult.success) {
						const userOptions = usersResult.data.map((user) => ({ id: user.id, label: user.name }));
						next.fields.users = {
							...next.fields.users,
							options: userOptions,
						};
					}
					if (programsResult.success) {
						const programOptions = programsResult.data.map((program) => ({ id: program.id, label: program.name }));
						next.fields.ownedPrograms = {
							...next.fields.ownedPrograms,
							options: programOptions,
						};
						next.fields.operatedPrograms = {
							...next.fields.operatedPrograms,
							options: programOptions,
						};
					}

					if (organizationId && organizationResult?.success) {
						next.fields.name.value = organizationResult.data.name;
						next.fields.users.value = organizationResult.data.userIds;
						next.fields.ownedPrograms.value = organizationResult.data.ownedProgramIds;
						next.fields.operatedPrograms.value = organizationResult.data.operatedProgramIds;
					}

					return next;
				});

				if (organizationId && organizationResult && !organizationResult.success) {
					onError?.(organizationResult.error);
				}
			} catch (error) {
				onError?.(error);
			}
		});
	}, [organizationId, onError]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={organizationId ? 'edit' : 'add'}
		/>
	);
}
