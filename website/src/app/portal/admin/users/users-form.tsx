'use client';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import { UserRole } from '@/generated/prisma/enums';
import { createUserAction, getUserAction, getUserOptionsAction, updateUserAction } from '@/lib/server-actions/user-actions';
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
		organizationId: FormField;
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
		organizationId: {
			placeholder: 'Organization',
			label: 'Organization',
		},
	},
};

export default function UsersForm({ onSuccess, onError, onCancel, userId }: UserFormProps) {
	const [formSchema, setFormSchema] = useState(initialFormSchema);
	const [user, setUser] = useState<UserPayload>();
	const [isLoading, startTransition] = useTransition();

	const loadUser = async (id: string) => {
		const result = await getUserAction(id);
		handleServiceResult(result, {
			onSuccess: (data) => {
				setUser(data);
				setFormSchema((prev) => ({
					...prev,
					fields: {
						...prev.fields,
						firstName: { ...prev.fields.firstName, value: data.firstName },
						lastName: { ...prev.fields.lastName, value: data.lastName },
						email: { ...prev.fields.email, value: data.email },
						role: { ...prev.fields.role, value: data.role },
						organizationId: { ...prev.fields.organizationId, value: data.organizationId },
					},
				}));
			},
			onError: (error) => onError?.(error),
		});
	};

	const setOptions = (organizations: { id: string; name: string }[]) => {
		const optionsToZodEnum = (opts: { id: string; name: string }[]) =>
			getZodEnum(opts.map(({ id, name }) => ({ id, label: name })));

		const orgEnum = optionsToZodEnum(organizations);

		setFormSchema((prev) => ({
			...prev,
			fields: {
				...prev.fields,
				organizationId: {
					...prev.fields.organizationId,
					zodSchema: z.nativeEnum(orgEnum),
					value:
						prev.fields.organizationId.value ??
						(organizations.length > 0 ? organizations[0].id : prev.fields.organizationId.value),
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

	useEffect(() => {
		if (!userId) {
			return;
		}
		startTransition(async () => await loadUser(userId));
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
			mode={userId ? 'edit' : 'add'}
		/>
	);
}
