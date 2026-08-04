'use client';

import { FormField, FormItem } from '@/components/form';
import { Input } from '@/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { cn } from '@/lib/utils/cn';
import { addDays, format } from 'date-fns';
import { FieldLabel } from '../field-label';
import type { CampaignSubmissionStepProps } from '../types';

type Props = Pick<
	CampaignSubmissionStepProps,
	| 'form'
	| 'labels'
	| 'primaryImageInputRef'
	| 'onImageChange'
	| 'imageError'
	| 'showImageRequired'
	| 'showDetailsErrors'
	| 'submitError'
>;

export const DetailsStep = ({
	form,
	labels,
	primaryImageInputRef,
	onImageChange,
	imageError,
	showImageRequired,
	showDetailsErrors,
	submitError,
}: Props) => {
	return (
		<div className="flex flex-col gap-4">
			<FormField
				control={form.control}
				name="title"
				render={({ field, fieldState }) => (
					<FormItem>
						<FieldLabel htmlFor={field.name} showRequired={showDetailsErrors && Boolean(fieldState.error)}>
							{labels.title}
						</FieldLabel>
						<Input {...field} id={field.name} autoComplete="off" />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="description"
				render={({ field, fieldState }) => (
					<FormItem>
						<FieldLabel htmlFor={field.name} showRequired={showDetailsErrors && Boolean(fieldState.error)}>
							{labels.description}
						</FieldLabel>
						<textarea
							{...field}
							id={field.name}
							rows={4}
							className={cn(
								'placeholder:text-muted-foreground border-border text-foreground w-full min-w-0 rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden',
								'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
							)}
						/>
					</FormItem>
				)}
			/>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormField
					control={form.control}
					name="goal"
					render={({ field, fieldState }) => (
						<FormItem>
							<FieldLabel htmlFor={field.name} showRequired={showDetailsErrors && Boolean(fieldState.error)}>
								{labels.goal}
							</FieldLabel>
							<Input {...field} id={field.name} type="number" min={1} step="0.01" value={field.value ?? ''} />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="currency"
					render={({ field, fieldState }) => (
						<FormItem>
							<FieldLabel htmlFor={field.name} showRequired={showDetailsErrors && Boolean(fieldState.error)}>
								{labels.currency}
							</FieldLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<SelectTrigger id={field.name}>
									<SelectValue placeholder={labels.currencyPlaceholder} />
								</SelectTrigger>
								<SelectContent>
									{campaignSubmissionConfig.allowedCurrencies.map((currency) => (
										<SelectItem key={currency} value={currency}>
											{currency}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormItem>
					)}
				/>
			</div>
			<FormField
				control={form.control}
				name="endDate"
				render={({ field, fieldState }) => (
					<FormItem>
						<FieldLabel htmlFor={field.name} showRequired={showDetailsErrors && Boolean(fieldState.error)}>
							{labels.endDate}
						</FieldLabel>
						<Input
							{...field}
							id={field.name}
							type="date"
							min={format(addDays(new Date(), campaignSubmissionConfig.minCampaignDurationDays), 'yyyy-MM-dd')}
							max={format(addDays(new Date(), campaignSubmissionConfig.maxCampaignDurationDays), 'yyyy-MM-dd')}
						/>
					</FormItem>
				)}
			/>
			<div className="flex flex-col gap-2">
				<FieldLabel htmlFor="campaign-primary-image" showRequired={showImageRequired}>
					{labels.primaryImage}
				</FieldLabel>
				<Input
					id="campaign-primary-image"
					ref={primaryImageInputRef}
					type="file"
					accept={campaignSubmissionConfig.permittedImageMimeTypes.join(',')}
					onChange={(event) => {
						onImageChange(event.target.files?.[0] ?? null);
					}}
				/>
				<p className="text-muted-foreground text-xs">{labels.imageHint}</p>
				{imageError ? <p className="text-destructive text-sm">{imageError}</p> : null}
			</div>
			{submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
		</div>
	);
};
