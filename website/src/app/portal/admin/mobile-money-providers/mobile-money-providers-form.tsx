'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
import { PAYOUT_PROCESS_OPTIONS } from '@/lib/payout-process-options';
import { handleResult } from '@/lib/result-client';
import {
	createMobileMoneyProviderAction,
	deleteMobileMoneyProviderAction,
	getMobileMoneyProviderAction,
	getMobileMoneyProviderOptionsAction,
	updateMobileMoneyProviderAction,
} from '@/modules/mobile-money-providers/mobile-money-provider.actions';
import type { MobileMoneyProviderPayload } from '@/modules/mobile-money-providers/mobile-money-provider.types';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useTransition } from 'react';
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
		payoutProcess: FormField;
	};
};

const getInitialFormSchema = (
	t: ReturnType<typeof useTranslations<'portal-admin'>>,
	payoutProcessFormOptions: { id: string; label: string }[],
): MobileMoneyProviderFormSchema => ({
	label: t('form.mobileMoneyProvider'),
	fields: {
		name: {
			placeholder: 'e.g. Orange Money',
			label: t('form.name'),
			zodSchema: z.string().trim().min(1, t('validation.requiredName')),
		},
		parentId: {
			placeholder: t('form.none'),
			label: t('form.parentProvider'),
			zodSchema: z.nativeEnum(getZodEnum([{ id: '', label: t('form.none') }])).optional(),
			useCombobox: true,
			options: [{ id: '', label: t('form.none') }],
		},
		payoutProcess: {
			placeholder: t('form.none'),
			label: t('form.payoutProcess'),
			zodSchema: z.nativeEnum(getZodEnum(payoutProcessFormOptions)).optional(),
			useCombobox: true,
			options: payoutProcessFormOptions,
		},
	},
});

export default function MobileMoneyProvidersForm({
	onSuccess,
	onError,
	onCancel,
	providerId,
}: MobileMoneyProviderFormProps) {
	const t = useTranslations('portal-admin');
	const initialFormSchema = useMemo(
		() =>
			getInitialFormSchema(t, [
				{ id: '', label: t('form.none') },
				...PAYOUT_PROCESS_OPTIONS.map((option) => ({
					...option,
					label: option.id === 'orange_money_csv' ? t('payoutProcess.orangeMoneyCsv') : t('payoutProcess.telecelCsv'),
				})),
			]),
		[t],
	);
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [provider, setProvider] = useState<MobileMoneyProviderPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: MobileMoneyProviderFormSchema) => {
		startTransition(async () => {
			const result =
				providerId && provider
					? await updateMobileMoneyProviderAction(buildUpdateMobileMoneyProviderInput(schema, provider))
					: await createMobileMoneyProviderAction(buildCreateMobileMoneyProviderInput(schema));
			handleResult(result, {
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
			handleResult(result, {
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

				if (providerId && providerResult?.success) {
					setProvider(providerResult.data);
				}

				setFormSchema(() => {
					const next = cloneFormSchema(initialFormSchema);

					const filteredOptions = (optionsResult.success ? optionsResult.data : [])
						.filter((o) => o.id !== providerId)
						.map((o) => ({ id: o.id, label: o.name }));

					const parentEnum = getZodEnum([{ id: '', label: t('form.none') }, ...filteredOptions]);
					next.fields.parentId = {
						...next.fields.parentId,
						options: [{ id: '', label: t('form.none') }, ...filteredOptions],
						zodSchema: z.nativeEnum(parentEnum).optional(),
					};

					if (providerId && providerResult?.success) {
						next.fields.name.value = providerResult.data.name;
						next.fields.payoutProcess.value = providerResult.data.payoutProcess ?? '';
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
	}, [initialFormSchema, onError, providerId, t]);

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
