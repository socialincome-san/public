'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema } from '@/components/dynamic-form/helper';
import { UserRole } from '@/generated/prisma/enums';
import {
	createUserAction,
	deleteUserAction,
	getUserAction,
	getUserOptionsAction,
	updateUserAction,
} from '@/lib/server-actions/user-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import type { UserPayload } from '@/lib/services/user/user.types';
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
		editOrganizations: FormField;
		readonlyOrganizations: FormField;
	};
};

const initialFormSchema: UserFormSchema = {
	label: 'User',
	fields: {
		firstName: {
			placeholder: 'First name',
			label: 'First name',
			zodSchema: z.string().trim().min(1, 'First name is required.'),
		},
		lastName: {
			placeholder: 'Last name',
			label: 'Last name',
			zodSchema: z.string().trim().min(1, 'Last name is required.'),
		},
		email: {
			placeholder: 'Email',
			label: 'Email',
			zodSchema: z.string().trim().email('Please provide a valid email address.'),
		},
		role: {
			placeholder: 'Role',
			label: 'Role',
			zodSchema: z.nativeEnum(UserRole),
			value: UserRole.user,
		},
		editOrganizations: {
			placeholder: 'Select organizations',
			label: 'Organizations with edit permission',
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
		readonlyOrganizations: {
			placeholder: 'Select organizations',
			label: 'Organizations with read permission',
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
	},
};

export default function UsersForm({ onSuccess, onError, onCancel, userId }: UserFormProps) {
	const [formSchema, setFormSchema] = useState(() => cloneFormSchema(initialFormSchema));
	const [user, setUser] = useState<UserPayload>();
	const [isLoading, startTransition] = useTransition();

	const loadUser = async (id: string) => {
		const result = await getUserAction(id);
		handleServiceResult(result, {
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
							editOrganizations: { ...next.fields.editOrganizations, value: data.editOrganizationIds },
							readonlyOrganizations: {
								...next.fields.readonlyOrganizations,
								value: data.readonlyOrganizationIds,
							},
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
				editOrganizations: {
					...prev.fields.editOrganizations,
					options,
				},
				readonlyOrganizations: {
					...prev.fields.readonlyOrganizations,
					options,
				},
			},
		}));
	};

	const onSubmit = (schema: UserFormSchema) => {
		startTransition(async () => {
			if (userId && user?.id !== userId) {
				return onError?.('User is still loading. Please try again.');
			}
			const result =
				userId && user
					? await updateUserAction(buildUpdateUserInput(schema, user))
					: await createUserAction(buildCreateUserInput(schema));
			handleServiceResult(result, {
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
			handleServiceResult(result, {
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
