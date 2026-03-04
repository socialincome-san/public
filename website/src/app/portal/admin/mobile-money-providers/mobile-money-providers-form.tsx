'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import {
	createMobileMoneyProviderAction,
	deleteMobileMoneyProviderAction,
	getMobileMoneyProviderAction,
	updateMobileMoneyProviderAction,
} from '@/lib/server-actions/mobile-money-provider-action';
import type { MobileMoneyProviderPayload } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import {
	buildCreateMobileMoneyProviderInput,
	buildUpdateMobileMoneyProviderInput,
} from './mobile-money-providers-form-helper';

type MobileMoneyProviderFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	providerId?: string;
};

export type MobileMoneyProviderFormSchema = {
	label: string;
	fields: {
		name: FormField;
		isSupported: FormField;
	};
};

const initialFormSchema: MobileMoneyProviderFormSchema = {
	label: 'Mobile Money Provider',
	fields: {
		name: {
			placeholder: 'e.g. Orange Money',
			label: 'Name',
			zodSchema: z.string().min(1, 'Name is required'),
		},
		isSupported: {
			placeholder: 'Supported',
			label: 'Is Supported',
			zodSchema: z.boolean().optional(),
		},
	},
};

export default function MobileMoneyProvidersForm({
	onSuccess,
	onError,
	onCancel,
	providerId,
}: MobileMoneyProviderFormProps) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [provider, setProvider] = useState<MobileMoneyProviderPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: MobileMoneyProviderFormSchema) => {
		startTransition(async () => {
			try {
				let result: { success: boolean; error?: string };
				if (providerId && provider) {
					const data = buildUpdateMobileMoneyProviderInput(schema, provider);
					result = await updateMobileMoneyProviderAction(data);
				} else {
					const data = buildCreateMobileMoneyProviderInput(schema);
					result = await createMobileMoneyProviderAction(data);
				}

				result.success ? onSuccess?.() : onError?.(result.error);
			} catch (e) {
				onError?.(e);
			}
		});
	};

	const onDelete = () => {
		if (!providerId) {
			return;
		}

		startTransition(async () => {
			try {
				const result = await deleteMobileMoneyProviderAction(providerId);
				result.success ? onSuccess?.() : onError?.(result.error);
			} catch (e) {
				onError?.(e);
			}
		});
	};

	useEffect(() => {
		if (!providerId) {
			return;
		}
		startTransition(async () => {
			try {
				const result = await getMobileMoneyProviderAction(providerId);
				if (result.success) {
					setProvider(result.data);
					setFormSchema((prev) => {
						const next = { ...prev };
						next.fields.name.value = result.data.name;
						next.fields.isSupported.value = result.data.isSupported;
						return next;
					});
				} else {
					onError?.(result.error);
				}
			} catch (e) {
				onError?.(e);
			}
		});
	}, [providerId, onError]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={providerId ? 'edit' : 'add'}
		/>
	);
}
