'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import {
	createMobileMoneyProviderAction,
	deleteMobileMoneyProviderAction,
	getMobileMoneyProviderAction,
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
		if (!providerId) {
			return;
		}
		startTransition(async () => {
			const result = await getMobileMoneyProviderAction(providerId);
			handleServiceResult(result, {
				onSuccess: (data) => {
					setProvider(data);
					setFormSchema((prev) => {
						const next = { ...prev };
						next.fields.name.value = data.name;
						next.fields.isSupported.value = data.isSupported;

						return next;
					});
				},
				onError: (error) => onError?.(error),
			});
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
