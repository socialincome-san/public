'use client';

import { FormField, FormItem } from '@/components/form';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { cn } from '@/lib/utils/cn';
import { addDays, format } from 'date-fns';
import type { CampaignSubmissionStepProps } from '../types';

type Props = Pick<
	CampaignSubmissionStepProps,
	'form' | 'labels' | 'primaryImageInputRef' | 'onImageChange' | 'imageError' | 'submitError'
>;

export const DetailsStep = ({
	form,
	labels,
	primaryImageInputRef,
	onImageChange,
	imageError,
	submitError,
}: Props) => {
	return (
		<div className="flex flex-col gap-4">
			<FormField
				control={form.control}
				name="title"
				render={({ field }) => (
					<FormItem>
						<Label htmlFor={field.name}>{labels.title}</Label>
						<Input {...field} id={field.name} autoComplete="off" />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<Label htmlFor={field.name}>{labels.description}</Label>
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
					render={({ field }) => (
						<FormItem>
							<Label htmlFor={field.name}>{labels.goal}</Label>
							<Input {...field} id={field.name} type="number" min={1} step="0.01" />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="currency"
					render={({ field }) => (
						<FormItem>
							<Label htmlFor={field.name}>{labels.currency}</Label>
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
				render={({ field }) => (
					<FormItem>
						<Label htmlFor={field.name}>{labels.endDate}</Label>
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
				<Label htmlFor="campaign-primary-image">{labels.primaryImage}</Label>
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
