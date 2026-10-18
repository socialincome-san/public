'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { cloneFormSchema } from '@/components/dynamic-form/helper';
import { handleResult } from '@/lib/result-client';
import {
	createOrganizationAction,
	deleteOrganizationAction,
	getOrganizationAction,
	getOrganizationProgramOptionsAction,
	getOrganizationUserOptionsAction,
	updateOrganizationAction,
} from '@/modules/organizations/organization.actions';
import type { OrganizationPayload } from '@/modules/organizations/organization.types';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useTransition } from 'react';
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

const getInitialFormSchema = (t: ReturnType<typeof useTranslations<'portal-admin'>>): OrganizationFormSchema => ({
	label: t('form.organization'),
	fields: {
		name: {
			placeholder: t('form.organizationName'),
			label: t('form.name'),
			zodSchema: z.string().trim().min(1, t('validation.requiredOrganizationName')),
		},
		users: {
			label: t('form.users'),
			placeholder: t('form.selectUsers'),
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
		ownedPrograms: {
			label: t('form.ownedPrograms'),
			placeholder: t('form.selectOwnedPrograms'),
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
		operatedPrograms: {
			label: t('form.operatedPrograms'),
			placeholder: t('form.selectOperatedPrograms'),
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
	},
});

export default function OrganizationsForm({ onSuccess, onError, onCancel, organizationId }: OrganizationFormProps) {
	const t = useTranslations('portal-admin');
	const initialFormSchema = useMemo(() => getInitialFormSchema(t), [t]);
	const [formSchema, setFormSchema] = useState<OrganizationFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [organization, setOrganization] = useState<OrganizationPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: OrganizationFormSchema) => {
		startTransition(async () => {
			const result =
				organizationId && organization
					? await updateOrganizationAction(buildUpdateOrganizationInput(schema, organization.id))
					: await createOrganizationAction(buildCreateOrganizationInput(schema));
			handleResult(result, {
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
			handleResult(result, {
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
	}, [initialFormSchema, onError, organizationId]);

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
