'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { NetworkTechnology, SanctionRegime } from '@/generated/prisma/enums';
import { createCountryAction, getCountryAction, updateCountryAction } from '@/lib/server-actions/country-action';
import { getMobileMoneyProviderOptionsAction } from '@/lib/server-actions/mobile-money-provider-action';
import { CountryPayload, NETWORK_TECH_LABELS } from '@/lib/services/country/country.types';
import { COUNTRY_OPTIONS } from '@/lib/types/country';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateCountryInput, buildUpdateCountryInput } from './countries-form-helper';

type CountryFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	countryId?: string;
};

export type CountryFormSchema = {
	label: string;
	fields: {
		isoCode: FormField;
		isActive: FormField;
		microfinanceIndex: FormField;
		microfinanceSourceText: FormField;
		microfinanceSourceHref: FormField;
		populationCoverage: FormField;
		latestSurveyDate: FormField;
		networkTechnology: FormField;
		networkSourceText: FormField;
		networkSourceHref: FormField;
		mobileMoneyProviders: FormField;
		sanctions: FormField;
	};
};

const initialFormSchema: CountryFormSchema = {
	label: 'Country',
	fields: {
		isoCode: {
			label: 'Country',
			zodSchema: z.enum(COUNTRY_OPTIONS.map((c) => c.code) as [string, ...string[]]),
			useCombobox: true,
			options: COUNTRY_OPTIONS.map((c) => ({
				id: c.code,
				label: c.name,
			})),
		},
		isActive: {
			placeholder: 'Active',
			label: 'Is Active',
			zodSchema: z.boolean().optional(),
		},
		microfinanceIndex: {
			placeholder: '4.92',
			label: 'MFI',
			zodSchema: z.coerce.number().min(0).max(10).optional(),
		},
		microfinanceSourceText: {
			placeholder: 'WFP',
			label: 'MFI source text',
			zodSchema: z.string().optional(),
		},
		microfinanceSourceHref: {
			placeholder: 'https://www.wfp.org',
			label: 'MFI source URL',
			zodSchema: z.string().optional(),
		},
		populationCoverage: {
			placeholder: '85',
			label: 'Population coverage %',
			zodSchema: z.coerce.number().min(0).max(100).optional(),
		},
		latestSurveyDate: {
			label: 'Most recent survey date',
			zodSchema: z.coerce.date().optional(),
		},
		networkTechnology: {
			placeholder: '3G',
			label: 'Technology',
			zodSchema: z.nativeEnum(NetworkTechnology).optional(),
			options: Object.entries(NETWORK_TECH_LABELS).map(([value, label]) => ({
				id: value,
				label,
			})),
		},
		networkSourceText: {
			placeholder: 'ITU',
			label: 'Technology source text',
			zodSchema: z.string().optional(),
		},
		networkSourceHref: {
			placeholder: 'https://www.itu.int',
			label: 'Technology source URL',
			zodSchema: z.string().optional(),
		},
		mobileMoneyProviders: {
			label: 'Mobile money providers',
			placeholder: 'Select mobile money providers',
			zodSchema: z.array(z.string()).optional(),
			options: [],
		},
		sanctions: {
			label: 'Sanctions',
			placeholder: 'Select sanctions',
			zodSchema: z.array(z.nativeEnum(SanctionRegime)).optional(),
		},
	},
};

export default function CountriesForm({ onSuccess, onError, onCancel, countryId }: CountryFormProps) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [country, setCountry] = useState<CountryPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: CountryFormSchema) => {
		startTransition(async () => {
			try {
				let result: { success: boolean; error?: string };
				if (countryId && country) {
					const data = buildUpdateCountryInput(schema, country);
					result = await updateCountryAction(data);
				} else {
					const data = buildCreateCountryInput(schema);
					result = await createCountryAction(data);
				}

				result.success ? onSuccess?.() : onError?.(result.error);
			} catch (e) {
				onError?.(e);
			}
		});
	};

	useEffect(() => {
		startTransition(async () => {
			try {
				const [countryResult, optionsResult] = await Promise.all([
					countryId ? getCountryAction(countryId) : Promise.resolve(null),
					getMobileMoneyProviderOptionsAction(),
				]);

				if (countryId && countryResult?.success) {
					setCountry(countryResult.data);
				}

				setFormSchema((prev) => {
					const next = { ...prev, fields: { ...prev.fields } };
					if (optionsResult.success && optionsResult.data.length > 0) {
						next.fields.mobileMoneyProviders = {
							...next.fields.mobileMoneyProviders,
							options: optionsResult.data.map((p) => ({ id: p.id, label: p.name })),
						};
					}
					if (countryId && countryResult?.success) {
						next.fields.isoCode.value = countryResult.data.isoCode;
						next.fields.isActive.value = countryResult.data.isActive;
						next.fields.microfinanceIndex.value = countryResult.data.microfinanceIndex ?? undefined;
						next.fields.microfinanceSourceText.value = countryResult.data.microfinanceSourceLink?.text ?? undefined;
						next.fields.microfinanceSourceHref.value = countryResult.data.microfinanceSourceLink?.href ?? undefined;
						next.fields.populationCoverage.value = countryResult.data.populationCoverage ?? undefined;
						next.fields.latestSurveyDate.value = countryResult.data.latestSurveyDate ?? undefined;
						next.fields.networkTechnology.value = countryResult.data.networkTechnology ?? undefined;
						next.fields.networkSourceText.value = countryResult.data.networkSourceLink?.text ?? undefined;
						next.fields.networkSourceHref.value = countryResult.data.networkSourceLink?.href ?? undefined;
						next.fields.mobileMoneyProviders.value = countryResult.data.mobileMoneyProviders?.map((p) => p.id) ?? [];
						next.fields.sanctions.value = countryResult.data.sanctions ?? [];
					}

					return next;
				});

				if (countryId && countryResult && !countryResult.success) {
					onError?.(countryResult.error);
				}
			} catch (e) {
				onError?.(e);
			}
		});
	}, [countryId, onError]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={countryId ? 'edit' : 'add'}
		/>
	);
}
