'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema } from '@/components/dynamic-form/helper';
import { handleResult } from '@/lib/result-client';
import { SLUG_REGEX } from '@/lib/utils/regex';
import { createFocusAction, deleteFocusAction, getFocusAction, updateFocusAction } from '@/modules/focuses/focus.actions';
import type { FocusPayload } from '@/modules/focuses/focus.types';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateFocusInput, buildUpdateFocusInput } from './focuses-form-helper';

type FocusFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	focusId?: string;
};

export type FocusFormSchema = {
	label: string;
	fields: {
		name: FormField;
		slug: FormField;
	};
};

const getInitialFormSchema = (t: ReturnType<typeof useTranslations<'portal-admin'>>): FocusFormSchema => ({
	label: t('form.focus'),
	fields: {
		name: {
			placeholder: t('form.focusExample'),
			label: t('form.name'),
			zodSchema: z.string().trim().min(1, t('validation.requiredName')),
		},
		slug: {
			placeholder: 'unique-readable-id',
			label: t('form.slug'),
			zodSchema: z.string().trim().min(1, t('validation.requiredSlug')).regex(SLUG_REGEX, t('validation.invalidSlug')),
		},
	},
});

export default function FocusesForm({ onSuccess, onError, onCancel, focusId }: FocusFormProps) {
	const t = useTranslations('portal-admin');
	const initialFormSchema = useMemo(() => getInitialFormSchema(t), [t]);
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [focus, setFocus] = useState<FocusPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: FocusFormSchema) => {
		startTransition(async () => {
			const result =
				focusId && focus
					? await updateFocusAction(buildUpdateFocusInput(schema, focus))
					: await createFocusAction(buildCreateFocusInput(schema));
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete = () => {
		if (!focusId) {
			return;
		}

		startTransition(async () => {
			const result = await deleteFocusAction(focusId);
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (!focusId) {
			return;
		}
		startTransition(async () => {
			const result = await getFocusAction(focusId);
			handleResult(result, {
				onSuccess: (data) => {
					setFocus(data);
					setFormSchema((prev) => {
						const next = clearFormSchemaValues(prev);
						next.fields.name.value = data.name;
						next.fields.slug.value = data.slug;

						return next;
					});
				},
				onError: (error) => onError?.(error),
			});
		});
	}, [focusId, onError]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={focusId ? 'edit' : 'add'}
		/>
	);
}
