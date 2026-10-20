'use client';

import { usePortalOperationsTranslations } from '@/app/portal/portal-operations-translations';
import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
import { PayoutInterval, Profile } from '@/generated/prisma/enums';
import { handleResult } from '@/lib/result-client';
import { getCountryNameByCode } from '@/lib/types/country';
import { SLUG_REGEX } from '@/lib/utils/regex';
import { getProgramCountryFeasibilityAction } from '@/modules/countries/country.actions';
import { getFocusOptionsAction } from '@/modules/focuses/focus.actions';
import {
	deleteProgramAction,
	getProgramOrganizationOptionsAction,
	getProgramSettingsAction,
	updateProgramSettingsAction,
} from '@/modules/programs/program.actions';
import type { ProgramSettingsPayload } from '@/modules/programs/program.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildUpdateProgramSettingsInput } from './program-settings-form-helper';

type ProgramSettingsFormProps = {
	programId: string;
	readOnly: boolean;
	onSuccess?: () => void;
	onCancel?: () => void;
	onError?: (error?: unknown) => void;
};

type ProgramSettingsFormSchema = {
	label: string;
	fields: {
		id: FormField;
		name: FormField;
		slug: FormField;
		country: FormField;
		coveredByReserves: FormField;
		programDurationInMonths: FormField;
		payoutPerInterval: FormField;
		payoutInterval: FormField;
		targetFocuses: FormField;
		targetProfiles: FormField;
		ownerOrganizations: FormField;
		operatorOrganizations: FormField;
	};
};

type CountryOption = {
	id: string;
	label: string;
};

type OrganizationOption = {
	id: string;
	label: string;
};

const fillFormSchema = (
	formSchema: ProgramSettingsFormSchema,
	settings: ProgramSettingsPayload,
	countryOptions: CountryOption[],
	organizationOptions: OrganizationOption[],
	focusOptions: { id: string; label: string }[],
	readOnly: boolean,
	countryRequiredMessage: string,
	countryInvalidMessage: string,
): ProgramSettingsFormSchema => {
	const nextSchema: ProgramSettingsFormSchema = {
		...formSchema,
		fields: {
			id: { ...formSchema.fields.id },
			name: { ...formSchema.fields.name },
			slug: { ...formSchema.fields.slug },
			country: { ...formSchema.fields.country },
			coveredByReserves: { ...formSchema.fields.coveredByReserves },
			programDurationInMonths: { ...formSchema.fields.programDurationInMonths },
			payoutPerInterval: { ...formSchema.fields.payoutPerInterval },
			payoutInterval: { ...formSchema.fields.payoutInterval },
			targetFocuses: { ...formSchema.fields.targetFocuses },
			targetProfiles: { ...formSchema.fields.targetProfiles },
			ownerOrganizations: { ...formSchema.fields.ownerOrganizations },
			operatorOrganizations: { ...formSchema.fields.operatorOrganizations },
		},
	};
	const readOnlyFields = readOnly || !settings.canEdit;
	const countryEnum = getZodEnum(countryOptions);

	nextSchema.fields.id.value = settings.id;
	nextSchema.fields.id.disabled = true;
	nextSchema.fields.name.value = settings.name;
	nextSchema.fields.slug.value = settings.slug;
	nextSchema.fields.country.value = settings.countryId;
	nextSchema.fields.coveredByReserves.value = settings.coveredByReserves;
	nextSchema.fields.country.options = countryOptions;
	nextSchema.fields.country.zodSchema =
		countryOptions.length > 0
			? z.nativeEnum(countryEnum, { errorMap: () => ({ message: countryInvalidMessage }) })
			: z.string().trim().min(1, countryRequiredMessage);
	nextSchema.fields.programDurationInMonths.value = settings.programDurationInMonths;
	nextSchema.fields.payoutPerInterval.value = settings.payoutPerInterval;
	nextSchema.fields.payoutInterval.value = settings.payoutInterval;
	nextSchema.fields.targetFocuses.value = settings.targetFocuses;
	nextSchema.fields.targetFocuses.options = focusOptions;
	nextSchema.fields.targetProfiles.value = settings.targetProfiles;
	nextSchema.fields.ownerOrganizations.options = organizationOptions;
	nextSchema.fields.ownerOrganizations.value = settings.ownerOrganizationIds;
	nextSchema.fields.operatorOrganizations.options = organizationOptions;
	nextSchema.fields.operatorOrganizations.value = settings.operatorOrganizationIds;

	nextSchema.fields.name.disabled = readOnlyFields;
	nextSchema.fields.slug.disabled = readOnlyFields;
	nextSchema.fields.country.disabled = readOnlyFields;
	nextSchema.fields.coveredByReserves.disabled = readOnlyFields;
	nextSchema.fields.programDurationInMonths.disabled = readOnlyFields;
	nextSchema.fields.payoutPerInterval.disabled = readOnlyFields;
	nextSchema.fields.payoutInterval.disabled = readOnlyFields;
	nextSchema.fields.targetFocuses.disabled = readOnlyFields;
	nextSchema.fields.targetProfiles.disabled = readOnlyFields;
	nextSchema.fields.ownerOrganizations.disabled = readOnlyFields;
	nextSchema.fields.operatorOrganizations.disabled = readOnlyFields;

	return nextSchema;
};

export const ProgramSettingsForm = ({ programId, readOnly, onSuccess, onCancel, onError }: ProgramSettingsFormProps) => {
	const t = usePortalOperationsTranslations();
	const router = useRouter();
	const [isLoading, startTransition] = useTransition();
	const initialFormSchema: ProgramSettingsFormSchema = {
		label: t('program.settings.title'),
		fields: {
			id: {
				label: t('program.settings.id'),
				placeholder: '-',
				zodSchema: z.string().optional(),
				disabled: true,
			},
			name: {
				label: t('program.settings.name'),
				placeholder: t('program.settings.program_name'),
				zodSchema: z.string().trim().min(2, t('program.settings.name_minimum')),
			},
			slug: {
				label: t('program.settings.slug'),
				placeholder: 'program-slug',
				zodSchema: z
					.string()
					.trim()
					.min(1, t('program.settings.slug_required'))
					.regex(SLUG_REGEX, t('program.settings.slug_invalid')),
			},
			country: {
				label: t('program.settings.country'),
				placeholder: t('program.settings.select_country'),
				useCombobox: true,
				zodSchema: z.string().optional(),
				options: [],
			},
			coveredByReserves: {
				label: t('program.settings.covered_by_reserves'),
				zodSchema: z.boolean().optional(),
			},
			programDurationInMonths: {
				label: t('program.settings.duration_months'),
				placeholder: '12',
				zodSchema: z.coerce
					.number({ invalid_type_error: t('program.settings.invalid_number') })
					.int(t('program.settings.duration_integer'))
					.min(1, t('program.settings.duration_minimum')),
			},
			payoutPerInterval: {
				label: t('program.settings.payout_per_interval'),
				placeholder: '50',
				zodSchema: z.coerce
					.number({ invalid_type_error: t('program.settings.invalid_number') })
					.positive(t('program.settings.payout_positive')),
			},
			payoutInterval: {
				label: t('program.settings.payout_interval'),
				placeholder: t('program.settings.select_interval'),
				zodSchema: z.nativeEnum(PayoutInterval, {
					errorMap: () => ({ message: t('program.settings.interval_invalid') }),
				}),
				options: [
					{ id: PayoutInterval.monthly, label: t('program.settings.monthly') },
					{ id: PayoutInterval.quarterly, label: t('program.settings.quarterly') },
					{ id: PayoutInterval.yearly, label: t('program.settings.yearly') },
				],
			},
			targetFocuses: {
				label: t('program.settings.target_focuses'),
				placeholder: t('program.settings.select_focuses'),
				zodSchema: z.array(z.string().trim().min(1, t('program.settings.focus_required'))).optional(),
				options: [],
			},
			targetProfiles: {
				label: t('program.settings.target_profiles'),
				placeholder: t('program.settings.select_profiles'),
				zodSchema: z
					.array(
						z.nativeEnum(Profile, {
							errorMap: () => ({ message: t('program.settings.profile_invalid') }),
						}),
					)
					.optional(),
				options: Object.values(Profile).map((profile) => ({
					id: profile,
					label: profile.replaceAll('_', ' '),
				})),
			},
			ownerOrganizations: {
				label: t('program.settings.owner_organizations'),
				placeholder: t('program.settings.select_owner_organizations'),
				zodSchema: z.array(z.string()).optional(),
				options: [],
			},
			operatorOrganizations: {
				label: t('program.settings.operator_organizations'),
				placeholder: t('program.settings.select_operator_organizations'),
				zodSchema: z.array(z.string()).min(1, t('program.settings.operator_organization_required')),
				options: [],
			},
		},
	};
	const [formSchema, setFormSchema] = useState<ProgramSettingsFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [loadedSettings, setLoadedSettings] = useState<ProgramSettingsPayload | null>(null);

	const onSubmit = (schema: ProgramSettingsFormSchema) => {
		if (loadedSettings?.id !== programId) {
			onError?.(t('program.settings.still_loading'));

			return;
		}
		if (readOnly || loadedSettings?.canEdit === false) {
			onSuccess?.();

			return;
		}

		startTransition(async () => {
			const updateInput = buildUpdateProgramSettingsInput(programId, schema);
			const result = await updateProgramSettingsAction(updateInput);

			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete = () => {
		if (readOnly) {
			return;
		}
		startTransition(async () => {
			const result = await deleteProgramAction(programId);
			handleResult(result, {
				onSuccess: () => {
					onSuccess?.();
					router.push('/portal');
				},
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (!programId) {
			return;
		}
		startTransition(async () => {
			const [settingsResult, countryOptionsResult, organizationOptionsResult, focusOptionsResult] = await Promise.all([
				getProgramSettingsAction(programId),
				getProgramCountryFeasibilityAction(),
				getProgramOrganizationOptionsAction(programId),
				getFocusOptionsAction(),
			]);

			handleResult(settingsResult, {
				onSuccess: (settings) => {
					setLoadedSettings(settings);
					setFormSchema((previousSchema) => {
						const options: CountryOption[] = countryOptionsResult.success
							? countryOptionsResult.data.rows.map((row) => ({
									id: row.id,
									label: `${getCountryNameByCode(row.country.isoCode)} (${row.country.currency})`,
								}))
							: [];
						const organizationOptions: OrganizationOption[] = organizationOptionsResult.success
							? organizationOptionsResult.data.map((organization) => ({
									id: organization.id,
									label: organization.name,
								}))
							: [];
						const focusOptions = focusOptionsResult.success
							? focusOptionsResult.data.map((focus) => ({
									id: focus.id,
									label: focus.name,
								}))
							: [];

						return fillFormSchema(
							previousSchema,
							settings,
							options,
							organizationOptions,
							focusOptions,
							readOnly,
							t('program.settings.country_required'),
							t('program.settings.country_invalid'),
						);
					});
				},
				onError: (error) => onError?.(error),
			});
		});
	}, [programId, readOnly, onError, t]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={readOnly || loadedSettings?.canEdit === false ? 'readonly' : 'edit'}
		/>
	);
};
