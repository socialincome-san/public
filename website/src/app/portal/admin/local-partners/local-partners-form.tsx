'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import { getFocusOptionsAction } from '@/lib/server-actions/focus-action';
import {
	createLocalPartnerAction,
	deleteLocalPartnerAction,
	getLocalPartnerAction,
	updateLocalPartnerAction,
} from '@/lib/server-actions/local-partner-action';
import { ServiceResult } from '@/lib/services/core/base.types';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { LocalPartnerPayload } from '@/lib/services/local-partner/local-partner.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateLocalPartnerInput, buildUpdateLocalPartnerInput } from './local-partners-form-helper';

export type LocalPartnerFormSchema = {
	label: string;
	fields: {
		name: FormField;
		focuses: FormField;
		contact: FormSchema;
	};
};

const initialFormSchema: LocalPartnerFormSchema = {
	label: 'Local Partner',
	fields: {
		name: {
			placeholder: 'Name',
			label: 'Name',
			zodSchema: z.string().trim().min(1, 'Name is required.'),
		},
		focuses: {
			placeholder: 'Focuses',
			label: 'Focuses',
			zodSchema: z.array(z.string().trim().min(1)).optional(),
			options: [],
		},
		contact: {
			...getContactFormSchema({ isEmailRequired: true }),
		},
	},
};

export default function LocalPartnersForm({
	onSuccess,
	onError,
	onCancel,
	localPartnerId,
}: {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	localPartnerId?: string;
}) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [localPartner, setLocalPartner] = useState<LocalPartnerPayload>();
	const [isLoading, startTransition] = useTransition();

	const applyPartnerToSchema = (partner: LocalPartnerPayload) => {
		setLocalPartner(partner);
		setFormSchema((prev) => {
			const next = clearFormSchemaValues(prev);
			const contactValues = getContactValuesFromPayload(partner.contact, next.fields.contact.fields);
			next.fields.name.value = partner.name;
			next.fields.contact.fields = contactValues;
			next.fields.focuses.value = partner.focuses ?? [];

			return next;
		});
	};

	const loadData = async (partnerId: string | undefined) => {
		const [partnerResult, focusOptionsResult] = await Promise.all([
			partnerId ? getLocalPartnerAction(partnerId) : Promise.resolve(null),
			getFocusOptionsAction(),
		]);

		setFormSchema((prev) => {
			const next = cloneFormSchema(prev);
			if (focusOptionsResult.success) {
				next.fields.focuses.options = focusOptionsResult.data.map((focus) => ({
					id: focus.id,
					label: focus.name,
				}));
			}

			return next;
		});

		if (partnerId && partnerResult) {
			handleServiceResult(partnerResult, {
				onSuccess: applyPartnerToSchema,
				onError: (error) => onError?.(error),
			});
		}
	};

	const onSubmit = (schema: typeof initialFormSchema) => {
		startTransition(async () => {
			const result = await submitLocalPartner(schema);
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete = () => {
		if (!localPartnerId) {
			return;
		}

		startTransition(async () => {
			const result = await deleteLocalPartnerAction(localPartnerId);
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const submitLocalPartner = async (schema: typeof initialFormSchema): Promise<ServiceResult<unknown>> => {
		const contactFields: Record<string, FormField> = schema.fields.contact.fields;

		if (localPartnerId && localPartner) {
			const data = buildUpdateLocalPartnerInput(schema, localPartner, contactFields);

			return updateLocalPartnerAction({ id: localPartnerId, ...data }, 'user');
		}

		const data = buildCreateLocalPartnerInput(schema, contactFields);

		return createLocalPartnerAction(data);
	};

	useEffect(() => {
		startTransition(async () => {
			await loadData(localPartnerId);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [localPartnerId]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={localPartnerId ? 'edit' : 'add'}
		/>
	);
}
