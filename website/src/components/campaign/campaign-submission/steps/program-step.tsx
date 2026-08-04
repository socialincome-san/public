'use client';

import { FormField, FormItem } from '@/components/form';
import { Label } from '@/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import type { CampaignSubmissionStepProps } from '../types';

type Props = Pick<CampaignSubmissionStepProps, 'form' | 'labels' | 'programs' | 'programsError'>;

export const ProgramStep = ({ form, labels, programs, programsError }: Props) => {
	return (
		<div className="flex flex-col gap-4">
			<FormField
				control={form.control}
				name="programId"
				render={({ field }) => (
					<FormItem>
						<Label htmlFor={field.name}>{labels.program}</Label>
						<Select onValueChange={field.onChange} value={field.value || undefined}>
							<SelectTrigger id={field.name}>
								<SelectValue placeholder={labels.programPlaceholder} />
							</SelectTrigger>
							<SelectContent>
								{programs.map((program) => (
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
