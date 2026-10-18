'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
import { NetworkTechnology, SanctionRegime } from '@/generated/prisma/enums';
import { handleResult } from '@/lib/result-client';
import { COUNTRY_OPTIONS, isValidCountryCode } from '@/lib/types/country';
import { allCurrencies, bestGuessCurrency } from '@/lib/types/currency';
import {
	createCountryAction,
	deleteCountryAction,
	getCountryAction,
	updateCountryAction,
} from '@/modules/countries/country.actions';
import { type CountryPayload, NETWORK_TECH_LABELS } from '@/modules/countries/country.types';
import { getRootMobileMoneyProviderOptionsAction } from '@/modules/mobile-money-providers/mobile-money-provider.actions';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateCountryInput, buildUpdateCountryInput } from './countries-form-helper';

type PortalAdminTranslator = ReturnType<typeof useTranslations<'portal-admin'>>;

type CountryFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	countryId?: string;
};

export type CountryFormSchema = {
	label: string;
	fields: {
		countrySettings: {
			label: string;
			fields: {
				isoCode: FormField;
				isActive: FormField;
				currency: FormField;
				defaultPayoutAmount: FormField;
			};
		};
		suitabilityOfCash: {
			label: string;
			fields: {
				cashConditionOverride: FormField;
				microfinanceIndex: FormField;
				latestSurveyDate: FormField;
				microfinanceSourceText: FormField;
				microfinanceSourceHref: FormField;
			};
		};
		mobileMoney: {
			label: string;
			fields: {
				mobileMoneyConditionOverride: FormField;
				mobileMoneyProviders: FormField;
			};
		};
		mobileNetwork: {
			label: string;
			fields: {
				populationCoverage: FormField;
				networkTechnology: FormField;
				networkSourceText: FormField;
				networkSourceHref: FormField;
			};
		};
		noSanctions: {
			label: string;
			fields: {
				sanctions: FormField;
			};
		};
	};
};

const getInitialFormSchema = (t: PortalAdminTranslator): CountryFormSchema => ({
	label: t('form.country'),
	fields: {
		countrySettings: {
			label: t('form.countrySetup'),
			fields: {
				isoCode: {
					label: t('form.country'),
					zodSchema: z.enum(COUNTRY_OPTIONS.map((c) => c.code) as [string, ...string[]]),
					useCombobox: true,
					options: COUNTRY_OPTIONS.map((c) => ({
						id: c.code,
						label: c.name,
					})),
					onChange: (value, form) => {
						if (typeof value !== 'string' || !isValidCountryCode(value)) {
							return;
						}
						form.setValue('countrySettings.currency', bestGuessCurrency(value), {
							shouldValidate: true,
							shouldDirty: true,
						});
					},
				},
				isActive: {
					placeholder: t('form.active'),
					label: t('form.isActive'),
					zodSchema: z.boolean().optional(),
				},
				currency: {
					label: t('form.currency'),
					placeholder: t('form.selectCurrency'),
					useCombobox: true,
					zodSchema: z.nativeEnum(getZodEnum(allCurrencies.map((currency) => ({ id: currency, label: currency })))),
				},
				defaultPayoutAmount: {
					placeholder: '100',
					label: t('form.defaultPayoutAmount'),
					zodSchema: z.coerce.number().positive(t('validation.defaultPayoutPositive')),
				},
			},
		},
		suitabilityOfCash: {
			label: t('form.suitabilityOfCash'),
			fields: {
				cashConditionOverride: {
					label: t('form.overrideAutomatedResult'),
					zodSchema: z.boolean().optional(),
				},
				microfinanceIndex: {
					placeholder: '4.92',
					label: t('form.mfi'),
					zodSchema: z.coerce.number().min(0).max(10).optional(),
				},
				latestSurveyDate: {
					label: t('form.mostRecentSurveyDate'),
					zodSchema: z.coerce.date().optional(),
				},
				microfinanceSourceText: {
					placeholder: 'WFP',
					label: t('form.mfiSourceText'),
					zodSchema: z.string().optional(),
				},
				microfinanceSourceHref: {
					placeholder: 'https://www.wfp.org',
					label: t('form.mfiSourceUrl'),
					zodSchema: z.string().optional(),
				},
			},
		},
		mobileMoney: {
			label: t('form.mobileMoney'),
			fields: {
				mobileMoneyConditionOverride: {
					label: t('form.overrideAutomatedResult'),
					zodSchema: z.boolean().optional(),
				},
				mobileMoneyProviders: {
					label: t('form.mobileMoneyProviders'),
					placeholder: t('form.selectMobileMoneyProviders'),
					zodSchema: z.array(z.string()).optional(),
					options: [],
				},
			},
		},
		mobileNetwork: {
			label: t('form.mobileNetwork'),
			fields: {
				populationCoverage: {
					placeholder: '85',
					label: t('form.populationCoverage'),
					zodSchema: z.coerce.number().min(0).max(100).optional(),
				},
				networkTechnology: {
					placeholder: '3G',
					label: t('form.technology'),
					zodSchema: z.nativeEnum(NetworkTechnology).optional(),
					options: Object.entries(NETWORK_TECH_LABELS).map(([value, label]) => ({
						id: value,
						label,
					})),
				},
				networkSourceText: {
					placeholder: 'ITU',
					label: t('form.technologySourceText'),
					zodSchema: z.string().optional(),
				},
				networkSourceHref: {
					placeholder: 'https://www.itu.int',
					label: t('form.technologySourceUrl'),
					zodSchema: z.string().optional(),
				},
			},
		},
		noSanctions: {
			label: t('form.sanctions'),
			fields: {
				sanctions: {
					label: t('form.sanctions'),
					placeholder: t('form.selectSanctions'),
					zodSchema: z.array(z.nativeEnum(SanctionRegime)).optional(),
					options: [
						{ id: SanctionRegime.eu, label: t('sanctionRegimes.eu') },
						{ id: SanctionRegime.us, label: t('sanctionRegimes.us') },
						{ id: SanctionRegime.un, label: t('sanctionRegimes.un') },
						{ id: SanctionRegime.other, label: t('sanctionRegimes.other') },
					],
				},
			},
		},
	},
});

export default function CountriesForm({ onSuccess, onError, onCancel, countryId }: CountryFormProps) {
	const t = useTranslations('portal-admin');
	const initialFormSchema = useMemo(() => getInitialFormSchema(t), [t]);
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [country, setCountry] = useState<CountryPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: CountryFormSchema) => {
		startTransition(async () => {
			const result =
				countryId && country
					? await updateCountryAction(buildUpdateCountryInput(schema, country))
					: await createCountryAction(buildCreateCountryInput(schema));
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete = () => {
		if (!countryId) {
			return;
		}

		startTransition(async () => {
			const result = await deleteCountryAction(countryId);
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		startTransition(async () => {
			try {
				const [countryResult, optionsResult] = await Promise.all([
					countryId ? getCountryAction(countryId) : Promise.resolve(null),
					getRootMobileMoneyProviderOptionsAction(),
				]);

				if (countryId && countryResult?.success) {
					setCountry(countryResult.data);
				}

				setFormSchema(() => {
					const next = cloneFormSchema(initialFormSchema);
					if (optionsResult.success && optionsResult.data.length > 0) {
						next.fields.mobileMoney.fields.mobileMoneyProviders = {
							...next.fields.mobileMoney.fields.mobileMoneyProviders,
							options: optionsResult.data.map((p) => ({ id: p.id, label: p.name })),
						};
					}
					if (countryId && countryResult?.success) {
						next.fields.countrySettings.fields.isoCode.value = countryResult.data.isoCode;
						next.fields.countrySettings.fields.isActive.value = countryResult.data.isActive;
						next.fields.countrySettings.fields.currency.value = countryResult.data.currency;
						next.fields.countrySettings.fields.defaultPayoutAmount.value = countryResult.data.defaultPayoutAmount;
						next.fields.suitabilityOfCash.fields.cashConditionOverride.value =
							countryResult.data.cashConditionOverride ?? false;
						next.fields.suitabilityOfCash.fields.microfinanceIndex.value = countryResult.data.microfinanceIndex ?? undefined;
						next.fields.suitabilityOfCash.fields.latestSurveyDate.value = countryResult.data.latestSurveyDate ?? undefined;
						next.fields.suitabilityOfCash.fields.microfinanceSourceText.value =
							countryResult.data.microfinanceSourceLink?.text ?? undefined;
						next.fields.suitabilityOfCash.fields.microfinanceSourceHref.value =
							countryResult.data.microfinanceSourceLink?.href ?? undefined;
						next.fields.mobileNetwork.fields.populationCoverage.value = countryResult.data.populationCoverage ?? undefined;
						next.fields.mobileNetwork.fields.networkTechnology.value = countryResult.data.networkTechnology ?? undefined;
						next.fields.mobileNetwork.fields.networkSourceText.value =
							countryResult.data.networkSourceLink?.text ?? undefined;
						next.fields.mobileNetwork.fields.networkSourceHref.value =
							countryResult.data.networkSourceLink?.href ?? undefined;
						next.fields.mobileMoney.fields.mobileMoneyProviders.value =
							countryResult.data.mobileMoneyProviders?.map((p) => p.id) ?? [];
						next.fields.mobileMoney.fields.mobileMoneyConditionOverride.value =
							countryResult.data.mobileMoneyConditionOverride ?? false;
						next.fields.noSanctions.fields.sanctions.value = countryResult.data.sanctions ?? [];
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
	}, [countryId, initialFormSchema, onError]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={countryId ? 'edit' : 'add'}
		/>
	);
}
