'use client';

import { FormField, FormItem } from '@/components/form';
import { RadioGroup } from '@/components/radio-group';
import { getCountryNameByCode } from '@/lib/types/country';
import { useMemo, useState } from 'react';
import { ProgramCountryFilter, type ProgramCountryFilterOption } from '../program-country-filter';
import { ProgramOptionRow } from '../program-option-row';
import type { CampaignSubmissionStepProps } from '../types';

type Props = Pick<CampaignSubmissionStepProps, 'form' | 'labels' | 'programs' | 'programsLoading' | 'programsError'>;

export const ProgramStep = ({ form, labels, programs, programsLoading, programsError }: Props) => {
	const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
	const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);

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

	const filteredPrograms = useMemo(() => {
		if (!selectedCountryId) {
			return programs;
		}

		return programs.filter((program) => program.countryId === selectedCountryId);
	}, [programs, selectedCountryId]);

	const onCountryChange = (countryId: string | null) => {
		setSelectedCountryId(countryId);
		setExpandedProgramId(null);

		const selectedProgramId = form.getValues('programId');
		if (!selectedProgramId) {
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

	const onDetailsToggle = (programId: string) => {
		setExpandedProgramId((current) => (current === programId ? null : programId));
	};

	const getRecipientsLabel = (count: number) => labels.recipientsCount.replace('{{count}}', String(count));

	const statusMessage = programsLoading
		? labels.programsLoading
		: (programsError ?? (programs.length === 0 ? labels.programsEmpty : null));

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			{countryOptions.length > 0 ? (
				<div className="shrink-0 px-6">
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
						<div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
							{statusMessage ? (
								<p
									className={`px-6 text-sm ${programsError ? 'text-destructive' : 'text-muted-foreground'}`}
									role={programsError ? 'alert' : 'status'}
								>
									{statusMessage}
								</p>
							) : (
								<RadioGroup
									value={field.value || undefined}
									onValueChange={(value) => {
										field.onChange(value);
										form.clearErrors('programId');
									}}
									className="min-w-0 gap-0"
									aria-label={labels.program}
									aria-invalid={Boolean(fieldState.error)}
								>
									{filteredPrograms.map((program) => (
										<ProgramOptionRow
											key={program.id}
											value={program.id}
											name={program.name}
											selected={field.value === program.id}
											recipientsLabel={getRecipientsLabel(program.recipientsCount)}
											detailsLabel={labels.details}
											countryIsoCodes={[program.countryIsoCode]}
											expanded={expandedProgramId === program.id}
											onDetailsToggle={() => onDetailsToggle(program.id)}
											description={program.description}
											imageUrl={program.imageUrl}
											tags={program.tags}
										/>
									))}
								</RadioGroup>
							)}
						</div>
						{fieldState.error ? (
							<p className="text-destructive mt-2 shrink-0 px-6 text-sm">{fieldState.error.message}</p>
						) : null}
					</FormItem>
				)}
			/>
		</div>
	);
};
