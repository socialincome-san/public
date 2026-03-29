'use client';

import DynamicForm from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema } from '@/components/dynamic-form/helper';
import {
	createMessageTemplateAction,
	getMessageTemplateAction,
	updateMessageTemplateAction,
} from '@/lib/server-actions/messaging-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { useEffect, useState, useTransition } from 'react';
import {
	buildCreateMessageTemplateInput,
	buildUpdateMessageTemplateInput,
	initialFormSchema,
} from './message-templates-form-helper';

export default function MessageTemplatesForm({
	onSuccess,
	onError,
	onCancel,
	templateId,
	readOnly,
}: {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	templateId?: string;
	readOnly?: boolean;
}) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [isLoading, startTransition] = useTransition();
	const asOptionalString = (value: string | null | undefined) => value ?? undefined;

	const loadTemplate = async (id: string) => {
		const result = await getMessageTemplateAction(id);
		handleServiceResult(result, {
			onSuccess: (data) => {
				setFormSchema((previousSchema) => {
					const nextSchema = clearFormSchemaValues(previousSchema);

					return {
						...nextSchema,
						fields: {
							...nextSchema.fields,
							name: { ...nextSchema.fields.name, value: data.name },
							channel: { ...nextSchema.fields.channel, value: data.channel },
							subject: { ...nextSchema.fields.subject, value: asOptionalString(data.subject) },
							body: { ...nextSchema.fields.body, value: data.body },
							description: { ...nextSchema.fields.description, value: asOptionalString(data.description) },
							isActive: { ...nextSchema.fields.isActive, value: data.isActive },
						},
					};
				});
			},
			onError: (error) => onError?.(error),
		});
	};

	const onSubmit = (schema: typeof initialFormSchema) => {
		startTransition(async () => {
			const res = templateId
				? await updateMessageTemplateAction(buildUpdateMessageTemplateInput(schema, templateId))
				: await createMessageTemplateAction(buildCreateMessageTemplateInput(schema));
			handleServiceResult(res, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (templateId) {
			startTransition(async () => await loadTemplate(templateId));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templateId]);

	let mode: 'readonly' | 'edit' | 'add' = 'add';
	if (readOnly) {
		mode = 'readonly';
	} else if (templateId) {
		mode = 'edit';
	}

	return <DynamicForm formSchema={formSchema} isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} mode={mode} />;
}
