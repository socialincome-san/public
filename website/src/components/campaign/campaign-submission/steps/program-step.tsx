'use client';

import { FormField, FormItem } from '@/components/form';
import { RadioGroup } from '@/components/radio-group';
import { getCountryNameByCode } from '@/lib/types/country';
import { useMemo, useState } from 'react';
import { ProgramCountryFilter, type ProgramCountryFilterOption } from '../program-country-filter';
import { ProgramOptionRow } from '../program-option-row';
import type { CampaignSubmissionStepProps } from '../types';

export const SOCIAL_INCOME_ALL_PROGRAMS_OPTION_ID = 'social-income-all-programs';

type Props = Pick<CampaignSubmissionStepProps, 'form' | 'labels' | 'programs' | 'programsError'>;

export const ProgramStep = ({ form, labels, programs, programsError }: Props) => {
	const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);

	const countryOptions = useMemo((): ProgramCountryFilterOption[] => {
		const countsByCountryId = new Map<string, ProgramCountryFilterOption>();

		for (const program of programs) {
			const existing = countsByCountryId.get(program.countryId);
			if (existing) {
				existing.programCount += 1;
				continue;
			}

			countsByCountryId.set(program.countryId, {
				countryId: program.countryId,
				countryIsoCode: program.countryIsoCode,
				programCount: 1,
			});
		}

		return [...countsByCountryId.values()].sort((left, right) =>
			getCountryNameByCode(left.countryIsoCode).localeCompare(getCountryNameByCode(right.countryIsoCode)),
		);
	}, [programs]);

	const allProgramsSummary = useMemo(() => {
		const totalRecipients = programs.reduce((sum, program) => sum + program.recipientsCount, 0);
		const countryIsoCodes = [
			...new Map(programs.map((program) => [program.countryIsoCode, program.countryIsoCode] as const)).values(),
		].sort((left, right) => getCountryNameByCode(left).localeCompare(getCountryNameByCode(right)));

		return { totalRecipients, countryIsoCodes };
	}, [programs]);

	const filteredPrograms = useMemo(() => {
		if (!selectedCountryId) {
			return programs;
		}

		return programs.filter((program) => program.countryId === selectedCountryId);
	}, [programs, selectedCountryId]);

	const showAllProgramsOption = selectedCountryId === null && programs.length > 0;

	const onCountryChange = (countryId: string | null) => {
		setSelectedCountryId(countryId);

		const selectedProgramId = form.getValues('programId');
		if (!selectedProgramId) {
			return;
		}

		if (selectedProgramId === SOCIAL_INCOME_ALL_PROGRAMS_OPTION_ID) {
			if (countryId !== null) {
				form.setValue('programId', '');
				form.clearErrors('programId');
			}

			return;
		}

		const isStillVisible = programs.some(
			(program) => program.id === selectedProgramId && (countryId === null || program.countryId === countryId),
		);

		if (!isStillVisible) {
			form.setValue('programId', '');
			form.clearErrors('programId');
		}
	};

	const getRecipientsLabel = (count: number) => labels.recipientsCount.replace('{{count}}', String(count));

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			{countryOptions.length > 0 ? (
				<div className="shrink-0">
					<ProgramCountryFilter
						allCountriesLabel={labels.allCountries}
						options={countryOptions}
						selectedCountryId={selectedCountryId}
						onCountryChange={onCountryChange}
					/>
				</div>
			) : null}
			<FormField
				control={form.control}
				name="programId"
				render={({ field, fieldState }) => (
					<FormItem className="flex min-h-0 flex-1 flex-col gap-0">
						<div className="border-border min-h-0 flex-1 overflow-y-auto rounded-lg border">
							<RadioGroup
								value={field.value || undefined}
								onValueChange={(value) => {
									field.onChange(value);
									form.clearErrors('programId');
								}}
								className="gap-0 px-3"
								aria-label={labels.program}
								aria-invalid={Boolean(fieldState.error)}
							>
								{showAllProgramsOption ? (
									<ProgramOptionRow
										value={SOCIAL_INCOME_ALL_PROGRAMS_OPTION_ID}
										name={labels.allPrograms}
										selected={field.value === SOCIAL_INCOME_ALL_PROGRAMS_OPTION_ID}
										recipientsLabel={getRecipientsLabel(allProgramsSummary.totalRecipients)}
										detailsLabel={labels.details}
										countryIsoCodes={allProgramsSummary.countryIsoCodes}
									/>
								) : null}
								{filteredPrograms.map((program) => (
									<ProgramOptionRow
										key={program.id}
										value={program.id}
										name={program.name}
										selected={field.value === program.id}
										recipientsLabel={getRecipientsLabel(program.recipientsCount)}
										detailsLabel={labels.details}
										countryIsoCodes={[program.countryIsoCode]}
									/>
								))}
							</RadioGroup>
						</div>
						{fieldState.error ? <p className="text-destructive mt-2 shrink-0 text-sm">{fieldState.error.message}</p> : null}
						{programsError ? <p className="text-destructive mt-2 shrink-0 text-sm">{programsError}</p> : null}
					</FormItem>
				)}
			/>
		</div>
	);
};
