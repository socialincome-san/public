'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
import {
	createMobileMoneyProviderAction,
	deleteMobileMoneyProviderAction,
	getMobileMoneyProviderAction,
	getMobileMoneyProviderOptionsAction,
	updateMobileMoneyProviderAction,
} from '@/lib/server-actions/mobile-money-provider-action';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
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
		parentId: FormField;
		isSupported: FormField;
	};
};

const initialFormSchema: MobileMoneyProviderFormSchema = {
	label: 'Mobile Money Provider',
	fields: {
		name: {
			placeholder: 'e.g. Orange Money',
			label: 'Name',
			zodSchema: z.string().trim().min(1, 'Name is required.'),
		},
		parentId: {
			placeholder: 'None',
			label: 'Parent provider',
			zodSchema: z.nativeEnum(getZodEnum([{ id: '', label: 'None' }])).optional(),
			useCombobox: true,
			options: [{ id: '', label: 'None' }],
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
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [provider, setProvider] = useState<MobileMoneyProviderPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: MobileMoneyProviderFormSchema) => {
		startTransition(async () => {
			const result =
				providerId && provider
					? await updateMobileMoneyProviderAction(buildUpdateMobileMoneyProviderInput(schema, provider))
					: await createMobileMoneyProviderAction(buildCreateMobileMoneyProviderInput(schema));
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete = () => {
		if (!providerId) {
			return;
		}

		startTransition(async () => {
			const result = await deleteMobileMoneyProviderAction(providerId);
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		startTransition(async () => {
			try {
				const [optionsResult, providerResult] = await Promise.all([
					getMobileMoneyProviderOptionsAction(),
					providerId ? getMobileMoneyProviderAction(providerId) : Promise.resolve(null),
				]);

				if (optionsResult.success) {
					// no-op (used below to build schema)
				}

				if (providerId && providerResult?.success) {
					setProvider(providerResult.data);
				}

				setFormSchema(() => {
					const next = cloneFormSchema(initialFormSchema);

					const filteredOptions = (optionsResult.success ? optionsResult.data : [])
						.filter((o) => o.id !== providerId)
						.map((o) => ({ id: o.id, label: o.name }));

					const parentEnum = getZodEnum([{ id: '', label: 'None' }, ...filteredOptions]);
					next.fields.parentId = {
						...next.fields.parentId,
						options: [{ id: '', label: 'None' }, ...filteredOptions],
						zodSchema: z.nativeEnum(parentEnum).optional(),
					};

					if (providerId && providerResult?.success) {
						next.fields.name.value = providerResult.data.name;
						next.fields.isSupported.value = providerResult.data.isSupported;
						next.fields.parentId.value = providerResult.data.parentId ?? '';
					}

					return next;
				});

				if (providerId && providerResult && !providerResult.success) {
					onError?.(providerResult.error);
				}
				if (!optionsResult.success) {
					onError?.(optionsResult.error);
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
