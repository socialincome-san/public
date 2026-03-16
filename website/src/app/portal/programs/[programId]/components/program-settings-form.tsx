'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
import { Cause, PayoutInterval, Profile } from '@/generated/prisma/enums';
import { getProgramCountryFeasibilityAction } from '@/lib/server-actions/country-action';
import { getProgramSettingsAction, updateProgramSettingsAction } from '@/lib/server-actions/program-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { ProgramSettingsPayload } from '@/lib/services/program/program.types';
import { getCountryNameByCode } from '@/lib/types/country';
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

export type ProgramSettingsFormSchema = {
	label: string;
	fields: {
		id: FormField;
		name: FormField;
		country: FormField;
		programDurationInMonths: FormField;
		payoutPerInterval: FormField;
		payoutInterval: FormField;
		targetCauses: FormField;
		targetProfiles: FormField;
	};
};

const initialFormSchema: ProgramSettingsFormSchema = {
	label: 'Program settings',
	fields: {
		id: {
			label: 'Id',
			placeholder: '-',
			zodSchema: z.string().optional(),
			disabled: true,
		},
		name: {
			label: 'Name',
			placeholder: 'Program name',
			zodSchema: z.string().trim().min(2, 'Program name must be at least 2 characters.'),
		},
		country: {
			label: 'Country (currency)',
			placeholder: 'Select country',
			useCombobox: true,
			zodSchema: z.string().optional(),
			options: [],
		},
		programDurationInMonths: {
			label: 'Program duration in months',
			placeholder: '12',
			zodSchema: z.coerce.number().int().min(1),
		},
		payoutPerInterval: {
			label: 'Payout per interval',
			placeholder: '50',
			zodSchema: z.coerce.number().positive(),
		},
		payoutInterval: {
			label: 'Payout interval',
			placeholder: 'Select interval',
			zodSchema: z.nativeEnum(PayoutInterval),
			options: [
				{ id: PayoutInterval.monthly, label: 'Monthly' },
				{ id: PayoutInterval.quarterly, label: 'Quarterly' },
				{ id: PayoutInterval.yearly, label: 'Yearly' },
			],
		},
		targetCauses: {
			label: 'Target causes',
			placeholder: 'Select causes',
			zodSchema: z.array(z.nativeEnum(Cause)).optional(),
			options: Object.values(Cause).map((cause) => ({
				id: cause,
				label: cause.replaceAll('_', ' '),
			})),
		},
		targetProfiles: {
			label: 'Target profiles',
			placeholder: 'Select profiles',
			zodSchema: z.array(z.nativeEnum(Profile)).optional(),
			options: Object.values(Profile).map((profile) => ({
				id: profile,
				label: profile.replaceAll('_', ' '),
			})),
		},
	},
};

type CountryOption = {
	id: string;
	label: string;
};

const fillFormSchema = (
	formSchema: ProgramSettingsFormSchema,
	settings: ProgramSettingsPayload,
	countryOptions: CountryOption[],
	readOnly: boolean,
): ProgramSettingsFormSchema => {
	const nextSchema: ProgramSettingsFormSchema = {
		...formSchema,
		fields: {
			id: { ...formSchema.fields.id },
			name: { ...formSchema.fields.name },
			country: { ...formSchema.fields.country },
			programDurationInMonths: { ...formSchema.fields.programDurationInMonths },
			payoutPerInterval: { ...formSchema.fields.payoutPerInterval },
			payoutInterval: { ...formSchema.fields.payoutInterval },
			targetCauses: { ...formSchema.fields.targetCauses },
			targetProfiles: { ...formSchema.fields.targetProfiles },
		},
	};
	const readOnlyFields = readOnly || !settings.canEdit;
	const countryEnum = getZodEnum(countryOptions);

	nextSchema.fields.id.value = settings.id;
	nextSchema.fields.id.disabled = true;
	nextSchema.fields.name.value = settings.name;
	nextSchema.fields.country.value = settings.countryId;
	nextSchema.fields.country.options = countryOptions;
	nextSchema.fields.country.zodSchema =
		countryOptions.length > 0 ? z.nativeEnum(countryEnum) : z.string().trim().min(1, 'Country is required.');
	nextSchema.fields.programDurationInMonths.value = settings.programDurationInMonths;
	nextSchema.fields.payoutPerInterval.value = settings.payoutPerInterval;
	nextSchema.fields.payoutInterval.value = settings.payoutInterval;
	nextSchema.fields.targetCauses.value = settings.targetCauses;
	nextSchema.fields.targetProfiles.value = settings.targetProfiles;

	nextSchema.fields.name.disabled = readOnlyFields;
	nextSchema.fields.country.disabled = readOnlyFields;
	nextSchema.fields.programDurationInMonths.disabled = readOnlyFields;
	nextSchema.fields.payoutPerInterval.disabled = readOnlyFields;
	nextSchema.fields.payoutInterval.disabled = readOnlyFields;
	nextSchema.fields.targetCauses.disabled = readOnlyFields;
	nextSchema.fields.targetProfiles.disabled = readOnlyFields;

	return nextSchema;
};

export const ProgramSettingsForm = ({ programId, readOnly, onSuccess, onCancel, onError }: ProgramSettingsFormProps) => {
	const [isLoading, startTransition] = useTransition();
	const [formSchema, setFormSchema] = useState<ProgramSettingsFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [loadedSettings, setLoadedSettings] = useState<ProgramSettingsPayload | null>(null);

	const onSubmit = (schema: ProgramSettingsFormSchema) => {
		if (loadedSettings && loadedSettings.id !== programId) {
			onError?.('Program is still loading. Please try again.');

			return;
		}
		if (readOnly || loadedSettings?.canEdit === false) {
			onSuccess?.();

			return;
		}

		startTransition(async () => {
			const updateInput = buildUpdateProgramSettingsInput(programId, schema);
			const result = await updateProgramSettingsAction(updateInput);

			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (!programId) {
			return;
		}
		startTransition(async () => {
			const [settingsResult, countryOptionsResult] = await Promise.all([
				getProgramSettingsAction(programId),
				getProgramCountryFeasibilityAction(),
			]);

			handleServiceResult(settingsResult, {
				onSuccess: (settings) => {
					setLoadedSettings(settings);
					setFormSchema((previousSchema) => {
						const options: CountryOption[] = countryOptionsResult.success
							? countryOptionsResult.data.rows.map((row) => ({
									id: row.id,
									label: `${getCountryNameByCode(row.country.isoCode)} (${row.country.currency})`,
								}))
							: [];

						return fillFormSchema(previousSchema, settings, options, readOnly);
					});
				},
				onError: (error) => onError?.(error),
			});
		});
	}, [programId, readOnly, onError]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={readOnly || loadedSettings?.canEdit === false ? 'readonly' : 'edit'}
		/>
	);
};
