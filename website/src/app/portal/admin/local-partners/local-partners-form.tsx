'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import { Cause } from '@/generated/prisma/enums';
import {
	createLocalPartnerAction,
	getLocalPartnerAction,
	updateLocalPartnerAction,
} from '@/lib/server-actions/local-partner-action';
import { LocalPartnerPayload } from '@/lib/services/local-partner/local-partner.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateLocalPartnerInput, buildUpdateLocalPartnerInput } from './local-partners-form-helper';

export type LocalPartnerFormSchema = {
	label: string;
	fields: {
		name: FormField;
		causes: FormField;
		contact: FormSchema;
	};
};

const initialFormSchema: LocalPartnerFormSchema = {
	label: 'Local Partner',
	fields: {
		name: {
			placeholder: 'Name',
			label: 'Name',
			zodSchema: z.string(),
		},
		causes: {
			placeholder: 'Causes',
			label: 'Causes',
			zodSchema: z.array(z.nativeEnum(Cause)).optional(),
		},
		contact: {
			...getContactFormSchema(),
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
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [localPartner, setLocalPartner] = useState<LocalPartnerPayload>();
	const [isLoading, startTransition] = useTransition();

	const loadLocalPartner = async (localPartnerId: string) => {
		try {
			const partner = await getLocalPartnerAction(localPartnerId);
			if (partner.success) {
				setLocalPartner(partner.data);
				const newSchema = { ...formSchema };
				const contactValues = getContactValuesFromPayload(partner.data.contact, newSchema.fields.contact.fields);
				newSchema.fields.name.value = partner.data.name;
				newSchema.fields.contact.fields = contactValues;
				newSchema.fields.causes.value = partner.data.causes ?? [];
				setFormSchema(newSchema);
			} else {
				onError?.(partner.error);
			}
		} catch (error: unknown) {
			onError?.(error);
		}
	};

	async function onSubmit(schema: typeof initialFormSchema) {
		startTransition(async () => {
			try {
				let res: { success: boolean; error?: string };
				const contactFields: {
					[key: string]: FormField;
				} = schema.fields.contact.fields;
				if (localPartnerId && localPartner) {
					const data = buildUpdateLocalPartnerInput(schema, localPartner, contactFields);
					res = await updateLocalPartnerAction({ id: localPartnerId, ...data });
				} else {
					const data = buildCreateLocalPartnerInput(schema, contactFields);
					res = await createLocalPartnerAction(data);
				}
				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	}

	useEffect(() => {
		if (localPartnerId) {
			// Load local partner in edit mode
			startTransition(async () => await loadLocalPartner(localPartnerId));
		}
	}, [localPartnerId]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={localPartnerId ? 'edit' : 'add'}
		/>
	);
}
