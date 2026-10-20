import type { PortalSharedTranslate } from '@/components/portal-shared-translations';
import { Gender } from '@/generated/prisma/enums';
import { allWebsiteLanguages } from '@/lib/i18n/utils';
import { COUNTRY_OPTIONS } from '@/lib/types/country';
import { now } from '@/lib/utils/now';
import { E164_OPTIONAL_PHONE_REGEX } from '@/lib/utils/regex';
import z from 'zod';
import { FormSchema } from './dynamic-form';
import { getZodEnum } from './helper';

export const getFormSchema = (options?: { isEmailRequired?: boolean; translate?: PortalSharedTranslate }): FormSchema => {
	const t = options?.translate ?? ((_key, fallback) => fallback);

	return {
		label: t('form.contactSection', 'Contact'),
		fields: {
			firstName: {
				placeholder: t('form.firstName', 'First Name'),
				label: t('form.firstName', 'First Name'),
				zodSchema: z.string().min(2, {
					message: t('validation.nameMinLength', 'Name must be at least 2 characters.'),
				}),
			},
			lastName: {
				placeholder: t('form.lastName', 'Last Name'),
				label: t('form.lastName', 'Last Name'),
				zodSchema: z.string().min(2, {
					message: t('validation.nameMinLength', 'Name must be at least 2 characters.'),
				}),
			},
			callingName: {
				placeholder: t('form.callingName', 'Calling Name'),
				label: t('form.callingName', 'Calling Name'),
				zodSchema: z.string().nullable(),
			},
			email: {
				placeholder: t('form.email', 'Email'),
				label: t('form.email', 'Email'),
				zodSchema: options?.isEmailRequired ? z.string().email() : z.string().email().or(z.literal('')).optional(),
			},
			language: {
				placeholder: t('form.language', 'Language'),
				label: t('form.language', 'Language'),
				zodSchema: z.nativeEnum(getZodEnum(allWebsiteLanguages.map((l) => ({ id: l, label: l })))).optional(),
			},
			dateOfBirth: {
				label: t('form.dateOfBirth', 'Date of birth'),
				zodSchema: z
					.date()
					.max(now(), { message: t('validation.dateOfBirth', 'Date of birth must be in the past.') })
					.optional(),
			},
			profession: {
				placeholder: t('form.profession', 'Profession'),
				label: t('form.profession', 'Profession'),
				zodSchema: z.string().nullable(),
			},
			gender: {
				placeholder: t('form.chooseGender', 'Choose Gender'),
				label: t('form.gender', 'Gender'),
				zodSchema: z.nativeEnum(Gender).optional(),
			},
			phone: {
				placeholder: t('form.phoneNumber', 'Phone Number'),
				label: t('form.phoneNumber', 'Phone Number'),
				zodSchema: z
					.string()
					.regex(
						E164_OPTIONAL_PHONE_REGEX,
						t('validation.phoneFormat', 'Phone number must be empty or in valid E.164 format (e.g., +12345678901)'),
					)
					.optional(),
			},
			hasWhatsApp: {
				label: t('form.hasWhatsApp', 'Has WhatsApp'),
				zodSchema: z.boolean().optional(),
			},
			street: {
				placeholder: t('form.street', 'Street'),
				label: t('form.addressStreet', 'Address Street'),
				zodSchema: z.string().nullable(),
			},
			number: {
				placeholder: t('form.number', 'Number'),
				label: t('form.addressNumber', 'Address Number'),
				zodSchema: z.string().nullable(),
			},
			city: {
				placeholder: t('form.city', 'City'),
				label: t('form.addressCity', 'Address City'),
				zodSchema: z.string().nullable(),
			},
			zip: {
				placeholder: t('form.zip', 'ZIP'),
				label: t('form.addressZip', 'Address ZIP Code'),
				zodSchema: z.string().nullable(),
			},
			country: {
				placeholder: t('form.country', 'Country'),
				label: t('form.addressCountry', 'Address Country'),
				useCombobox: true,
				zodSchema: z
					.nativeEnum(
						getZodEnum(
							COUNTRY_OPTIONS.map((c) => ({
								id: c.code,
								label: c.name,
							})),
						),
					)
					.optional(),
			},
		},
	};
};
