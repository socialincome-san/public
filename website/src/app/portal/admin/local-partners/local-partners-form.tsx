'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import { usePortalSharedTranslations } from '@/components/portal-shared-translations';
import type { Result } from '@/lib/result';
import { handleResult } from '@/lib/result-client';
import { SLUG_REGEX } from '@/lib/utils/regex';
import { getFocusOptionsAction } from '@/modules/focuses/focus.actions';
import {
	createLocalPartnerAction,
	deleteLocalPartnerAction,
	getLocalPartnerAction,
	updateLocalPartnerAction,
} from '@/modules/local-partners/local-partner.actions';
import type { LocalPartnerPayload } from '@/modules/local-partners/local-partner.types';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateLocalPartnerInput, buildUpdateLocalPartnerInput } from './local-partners-form-helper';

export type LocalPartnerFormSchema = {
	label: string;
	fields: {
		name: FormField;
		slug: FormField;
		focuses: FormField;
		contact: FormSchema;
	};
};

const getInitialFormSchema = (
	t: ReturnType<typeof useTranslations<'portal-admin'>>,
	sharedTranslate: ReturnType<typeof usePortalSharedTranslations>['t'],
): LocalPartnerFormSchema => ({
	label: t('form.localPartner'),
	fields: {
		name: {
			placeholder: t('form.name'),
			label: t('form.name'),
			zodSchema: z.string().trim().min(1, t('validation.requiredName')),
		},
		slug: {
			placeholder: 'unique-readable-id',
			label: t('form.slug'),
			zodSchema: z.string().trim().min(1, t('validation.requiredSlug')).regex(SLUG_REGEX, t('validation.invalidSlug')),
		},
		focuses: {
			placeholder: t('form.focuses'),
			label: t('form.focuses'),
			zodSchema: z.array(z.string().trim().min(1)).optional(),
			options: [],
		},
		contact: {
			...getContactFormSchema({ isEmailRequired: true, translate: sharedTranslate }),
		},
	},
});

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
	const t = useTranslations('portal-admin');
	const { t: sharedTranslate } = usePortalSharedTranslations();
	const initialFormSchema = useMemo(() => getInitialFormSchema(t, sharedTranslate), [sharedTranslate, t]);
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [localPartner, setLocalPartner] = useState<LocalPartnerPayload>();
	const [isLoading, startTransition] = useTransition();

	const applyPartnerToSchema = (partner: LocalPartnerPayload) => {
		setLocalPartner(partner);
		setFormSchema((prev) => {
			const next = clearFormSchemaValues(prev);
			const contactValues = getContactValuesFromPayload(partner.contact, next.fields.contact.fields);
			next.fields.name.value = partner.name;
			next.fields.slug.value = partner.slug;
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

		if (!partnerId) {
			setLocalPartner(undefined);
			setFormSchema(cloneFormSchema(initialFormSchema));
		}

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
			handleResult(partnerResult, {
				onSuccess: applyPartnerToSchema,
				onError: (error) => onError?.(error),
			});
		}
	};

	const onSubmit = (schema: typeof initialFormSchema) => {
		startTransition(async () => {
			const result = await submitLocalPartner(schema);
			handleResult(result, {
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
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const submitLocalPartner = async (schema: typeof initialFormSchema): Promise<Result<unknown>> => {
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
