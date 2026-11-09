import { Gender } from '@/generated/prisma/enums';
import { allWebsiteLanguages } from '@/lib/i18n/utils';
import { COUNTRY_OPTIONS } from '@/lib/types/country';
import { now } from '@/lib/utils/now';
import { E164_OPTIONAL_PHONE_REGEX } from '@/lib/utils/regex';
import { type useTranslations } from 'next-intl';
import z from 'zod';
import { FormSchema } from './dynamic-form';
import { getZodEnum } from './helper';

export type PortalSharedTranslator = ReturnType<typeof useTranslations<'portal-shared'>>;

export const getFormSchema = (t: PortalSharedTranslator, options?: { isEmailRequired?: boolean }): FormSchema => ({
	label: t('form.contactSection'),
	fields: {
		firstName: {
			placeholder: t('form.firstName'),
			label: t('form.firstName'),
			zodSchema: z.string().min(2, {
				message: t('validation.nameMinLength'),
			}),
		},
		lastName: {
			placeholder: t('form.lastName'),
			label: t('form.lastName'),
			zodSchema: z.string().min(2, {
				message: t('validation.nameMinLength'),
			}),
		},
		callingName: {
			placeholder: t('form.callingName'),
			label: t('form.callingName'),
			zodSchema: z.string().nullable(),
		},
		email: {
			placeholder: t('form.email'),
			label: t('form.email'),
			zodSchema: options?.isEmailRequired ? z.string().email() : z.string().email().or(z.literal('')).optional(),
		},
		language: {
			placeholder: t('form.language'),
			label: t('form.language'),
			zodSchema: z.nativeEnum(getZodEnum(allWebsiteLanguages.map((l) => ({ id: l, label: l })))).optional(),
		},
		dateOfBirth: {
			label: t('form.dateOfBirth'),
			zodSchema: z
				.date()
				.max(now(), { message: t('validation.dateOfBirth') })
				.optional(),
		},
		profession: {
			placeholder: t('form.profession'),
			label: t('form.profession'),
			zodSchema: z.string().nullable(),
		},
		gender: {
			placeholder: t('form.chooseGender'),
			label: t('form.gender'),
			zodSchema: z.nativeEnum(Gender).optional(),
		},
		phone: {
			placeholder: t('form.phoneNumber'),
			label: t('form.phoneNumber'),
			zodSchema: z.string().regex(E164_OPTIONAL_PHONE_REGEX, t('validation.phoneFormat')).optional(),
		},
		hasWhatsApp: {
			label: t('form.hasWhatsApp'),
			zodSchema: z.boolean().optional(),
		},
		street: {
			placeholder: t('form.street'),
			label: t('form.addressStreet'),
			zodSchema: z.string().nullable(),
		},
		number: {
			placeholder: t('form.number'),
			label: t('form.addressNumber'),
			zodSchema: z.string().nullable(),
		},
		city: {
			placeholder: t('form.city'),
			label: t('form.addressCity'),
			zodSchema: z.string().nullable(),
		},
		zip: {
			placeholder: t('form.zip'),
			label: t('form.addressZip'),
			zodSchema: z.string().nullable(),
		},
		country: {
			placeholder: t('form.country'),
			label: t('form.addressCountry'),
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
});
