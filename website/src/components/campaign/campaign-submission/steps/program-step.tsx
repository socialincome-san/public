'use client';

import { FormField, FormItem } from '@/components/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { getCountryNameByCode } from '@/lib/types/country';
import { useMemo, useState } from 'react';
import { FieldLabel } from '../field-label';
import { ProgramCountryFilter, type ProgramCountryFilterOption } from '../program-country-filter';
import type { CampaignSubmissionStepProps } from '../types';

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

	const filteredPrograms = useMemo(() => {
		if (!selectedCountryId) {
			return programs;
		}

		return programs.filter((program) => program.countryId === selectedCountryId);
	}, [programs, selectedCountryId]);

	const onCountryChange = (countryId: string | null) => {
		setSelectedCountryId(countryId);

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

	return (
		<div className="flex flex-col gap-4">
			{countryOptions.length > 0 ? (
				<ProgramCountryFilter
					allCountriesLabel={labels.allCountries}
					options={countryOptions}
					selectedCountryId={selectedCountryId}
					onCountryChange={onCountryChange}
				/>
			) : null}
			<FormField
				control={form.control}
				name="programId"
				render={({ field, fieldState }) => (
					<FormItem>
						<FieldLabel htmlFor={field.name} showRequired={Boolean(fieldState.error)}>
							{labels.program}
						</FieldLabel>
						<Select
							onValueChange={(value) => {
								field.onChange(value);
								form.clearErrors('programId');
							}}
							value={field.value || undefined}
						>
							<SelectTrigger id={field.name}>
								<SelectValue placeholder={labels.programPlaceholder} />
							</SelectTrigger>
							<SelectContent>
								{filteredPrograms.map((program) => (
									<SelectItem key={program.id} value={program.id}>
										{program.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{programsError ? <p className="text-destructive text-sm">{programsError}</p> : null}
					</FormItem>
				)}
			/>
		</div>
	);
};
