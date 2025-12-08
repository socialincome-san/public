'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import {
	createUserAction,
	getUserAction,
	getUserOptionsAction,
	updateUserAction,
} from '@/lib/server-actions/user.actions';
import type { UserPayload } from '@/lib/services/user/user.types';
import { UserRole } from '@prisma/client';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateUserInput, buildUpdateUserInput } from './users-form-helper';

export type UserFormProps = {
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
			zodSchema: z.string().min(1),
		},
		lastName: {
			placeholder: 'Last name',
			label: 'Last name',
			zodSchema: z.string().min(1),
		},
		email: {
			placeholder: 'Email',
			label: 'Email',
			zodSchema: z.string().email(),
		},
		role: {
			placeholder: 'Role',
			label: 'Role',
			zodSchema: z.nativeEnum(UserRole),
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
		try {
			const result = await getUserAction(id);
			if (result.success) {
				setUser(result.data);

				const next = { ...formSchema };
				next.fields.firstName.value = result.data.firstName;
				next.fields.lastName.value = result.data.lastName;
				next.fields.email.value = result.data.email;
				next.fields.role.value = result.data.role;
				next.fields.organizationId.value = result.data.organizationId;
				setFormSchema(next);
			} else {
				onError?.(result.error);
			}
		} catch (e) {
			onError?.(e);
		}
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
				},
			},
		}));
	};

	const onSubmit = (schema: UserFormSchema) => {
		startTransition(async () => {
			try {
				let res: { success: boolean; error?: string };
				if (userId && user) {
					const data = buildUpdateUserInput(schema, user);
					res = await updateUserAction(data);
				} else {
					const data = buildCreateUserInput(schema);
					res = await createUserAction(data);
				}

				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (e) {
				onError?.(e);
			}
		});
	};

	useEffect(() => {
		if (!userId) return;
		startTransition(async () => await loadUser(userId));
	}, [userId]);

	useEffect(() => {
		startTransition(async () => {
			const res = await getUserOptionsAction();
			if (!res.success) return;
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
