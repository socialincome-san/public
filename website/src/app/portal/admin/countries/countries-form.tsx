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
			placeholder: 'Name',
			label: 'Name',
			zodSchema: z.string().min(1),
		},
		microfinanceIndex: {
			placeholder: 'Microfinance Index',
			label: 'Microfinance Index',
			zodSchema: z.coerce.number().min(0).max(100).optional(),
		},
		populationCoverage: {
			placeholder: 'Population Coverage %',
			label: 'Population Coverage %',
			zodSchema: z.coerce.number().min(0).max(100).optional(),
		},
		latestSurveyDate: {
			placeholder: 'Latest Survey Date',
			label: 'Latest Survey Date',
			zodSchema: z.coerce.date().optional(),
		},
		networkTechnology: {
			placeholder: 'Network Technology',
			label: 'Network Technology',
			zodSchema: z.nativeEnum(NetworkTechnology).optional(),
		},
	},
};

export default function CountriesForm({ onSuccess, onError, onCancel, countryId }: CountryFormProps) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [country, setCountry] = useState<CountryPayload>();
	const [isLoading, startTransition] = useTransition();

	const loadCountry = async (id: string) => {
		try {
			const result = await getCountryAction(id);
			if (result.success) {
				setCountry(result.data);
				const next = { ...formSchema };
				next.fields.name.value = result.data.name;
				next.fields.microfinanceIndex.value = result.data.microfinanceIndex ?? undefined;
				next.fields.populationCoverage.value = result.data.populationCoverage ?? undefined;
				next.fields.latestSurveyDate.value = result.data.latestSurveyDate ?? undefined;
				next.fields.networkTechnology.value = result.data.networkTechnology ?? undefined;
				setFormSchema(next);
			} else {
				onError?.(result.error);
			}
		} catch (e) {
			onError?.(e);
		}
	};

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
		startTransition(async () => await loadCountry(countryId));
	}, [countryId]);

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
