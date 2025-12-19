'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { createCountryAction, getCountryAction, updateCountryAction } from '@/lib/server-actions/country-action';
import { CountryPayload } from '@/lib/services/country/country.types';
import { NetworkTechnology } from '@prisma/client';
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
		name: FormField;
		microfinanceIndex: FormField;
		populationCoverage: FormField;
		latestSurveyDate: FormField;
		networkTechnology: FormField;
	};
};

const initialFormSchema: CountryFormSchema = {
	label: 'Country',
	fields: {
		name: {
			placeholder: 'Country name (e.g., Sierra Leone)',
			label: 'Country name',
			zodSchema: z.string().min(1),
		},
		microfinanceIndex: {
			placeholder: 'MFI (country average), 0–10 (e.g., 4.92)',
			label: 'MFI (country average)',
			zodSchema: z.coerce.number().min(0).max(10).optional(),
		},
		populationCoverage: {
			placeholder: 'Population coverage %, 0–100 (e.g., 85)',
			label: 'Population coverage %',
			zodSchema: z.coerce.number().min(0).max(100).optional(),
		},
		latestSurveyDate: {
			label: 'Most recent survey date',
			zodSchema: z.coerce.date().optional(),
		},
		networkTechnology: {
			placeholder: 'Technology (e.g., 3G, 4G, 5G)',
			label: 'Technology',
			zodSchema: z.nativeEnum(NetworkTechnology).optional(),
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
				let res: { success: boolean; error?: string };
				if (countryId && country) {
					const data = buildUpdateCountryInput(schema, country);
					res = await updateCountryAction(data);
				} else {
					const data = buildCreateCountryInput(schema);
					res = await createCountryAction(data);
				}
				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (e) {
				onError?.(e);
			}
		});
	};

	useEffect(() => {
		if (!countryId) {
			return;
		}
		startTransition(async () => {
			try {
				const result = await getCountryAction(countryId);
				if (result.success) {
					setCountry(result.data);
					setFormSchema((prev) => {
						const next = { ...prev };
						next.fields.name.value = result.data.name;
						next.fields.microfinanceIndex.value = result.data.microfinanceIndex ?? undefined;
						next.fields.populationCoverage.value = result.data.populationCoverage ?? undefined;
						next.fields.latestSurveyDate.value = result.data.latestSurveyDate ?? undefined;
						next.fields.networkTechnology.value = result.data.networkTechnology ?? undefined;
						return next;
					});
				} else {
					onError?.(result.error);
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
