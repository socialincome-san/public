'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema } from '@/components/dynamic-form/helper';
import { createFocusAction, deleteFocusAction, getFocusAction, updateFocusAction } from '@/lib/server-actions/focus-action';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import type { FocusPayload } from '@/lib/services/focus/focus.types';
import { useEffect, useState, useTransition } from 'react';
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
	};
};

const initialFormSchema: FocusFormSchema = {
	label: 'Focus',
	fields: {
		name: {
			placeholder: 'e.g. poverty',
			label: 'Name',
			zodSchema: z.string().trim().min(1, 'Name is required.'),
		},
	},
};

export default function FocusesForm({ onSuccess, onError, onCancel, focusId }: FocusFormProps) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [focus, setFocus] = useState<FocusPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: FocusFormSchema) => {
		startTransition(async () => {
			const result =
				focusId && focus
					? await updateFocusAction(buildUpdateFocusInput(schema, focus))
					: await createFocusAction(buildCreateFocusInput(schema));
			handleServiceResult(result, {
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
			handleServiceResult(result, {
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
			handleServiceResult(result, {
				onSuccess: (data) => {
					setFocus(data);
					setFormSchema((prev) => {
						const next = clearFormSchemaValues(prev);
						next.fields.name.value = data.name;

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
