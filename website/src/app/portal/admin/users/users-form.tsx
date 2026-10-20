'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema } from '@/components/dynamic-form/helper';
import { UserRole } from '@/generated/prisma/enums';
import { handleResult } from '@/lib/result-client';
import {
	createUserAction,
	deleteUserAction,
	getUserAction,
	getUserOptionsAction,
	updateUserAction,
} from '@/modules/users/user.actions';
import type { UserPayload } from '@/modules/users/user.types';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateUserInput, buildUpdateUserInput } from './users-form-helper';

type UserFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	userId?: string;
};

export type UserFormSchema = {
	label: string;
	fields: {
		firstName: FormField;
		lastName: FormField;
		email: FormField;
		role: FormField;
		organizations: FormField;
	};
};

const getInitialFormSchema = (t: ReturnType<typeof useTranslations<'portal-admin'>>): UserFormSchema => ({
	label: t('form.user'),
	fields: {
		firstName: {
			placeholder: t('form.firstName'),
			label: t('form.firstName'),
			zodSchema: z.string().trim().min(1, t('validation.requiredFirstName')),
		},
		lastName: {
			placeholder: t('form.lastName'),
			label: t('form.lastName'),
			zodSchema: z.string().trim().min(1, t('validation.requiredLastName')),
		},
		email: {
			placeholder: t('form.email'),
			label: t('form.email'),
			zodSchema: z.string().trim().email(t('validation.validEmail')),
		},
		role: {
			placeholder: t('form.role'),
			label: t('form.role'),
			zodSchema: z.nativeEnum(UserRole),
			value: UserRole.user,
			options: [
				{ id: UserRole.admin, label: t('userRoles.admin') },
				{ id: UserRole.user, label: t('userRoles.user') },
			],
		},
		organizations: {
			placeholder: t('form.selectOrganizations'),
			label: t('form.organizations'),
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
	},
});

export default function UsersForm({ onSuccess, onError, onCancel, userId }: UserFormProps) {
	const t = useTranslations('portal-admin');
	const initialFormSchema = getInitialFormSchema(t);
	const [formSchema, setFormSchema] = useState(() => cloneFormSchema(initialFormSchema));
	const [user, setUser] = useState<UserPayload>();
	const [isLoading, startTransition] = useTransition();

	const loadUser = async (id: string) => {
		const result = await getUserAction(id);
		handleResult(result, {
			onSuccess: (data) => {
				setUser(data);
				setFormSchema((prev) => {
					const next = clearFormSchemaValues(prev);

					return {
						...next,
						fields: {
							...next.fields,
							firstName: { ...next.fields.firstName, value: data.firstName },
							lastName: { ...next.fields.lastName, value: data.lastName },
							email: { ...next.fields.email, value: data.email },
							role: { ...next.fields.role, value: data.role },
							organizations: { ...next.fields.organizations, value: data.organizationIds },
						},
					};
				});
			},
			onError: (error) => onError?.(error),
		});
	};

	const setOptions = (organizations: { id: string; name: string }[]) => {
		const options = organizations.map(({ id, name }) => ({ id, label: name }));
		setFormSchema((prev) => ({
			...prev,
			fields: {
				...prev.fields,
				organizations: {
					...prev.fields.organizations,
					options,
				},
			},
		}));
	};

	const onSubmit = (schema: UserFormSchema) => {
		startTransition(async () => {
			if (userId && user?.id !== userId) {
				return onError?.(t('status.userLoading'));
			}
			const result =
				userId && user
					? await updateUserAction(buildUpdateUserInput(schema, user))
					: await createUserAction(buildCreateUserInput(schema));
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete = () => {
		if (!userId) {
			return;
		}

		startTransition(async () => {
			const result = await deleteUserAction(userId);
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (!userId) {
			return;
		}
		startTransition(async () => await loadUser(userId));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	useEffect(() => {
		startTransition(async () => {
			const res = await getUserOptionsAction();
			if (!res.success) {
				return;
			}
			setOptions(res.data);
		});
	}, []);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={userId ? 'edit' : 'add'}
		/>
	);
}
