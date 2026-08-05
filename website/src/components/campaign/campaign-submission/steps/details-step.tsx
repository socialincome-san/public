'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
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

export const DetailsStep = ({ form, labels, primaryImageInputRef, onImageChange, imageError, submitError }: Props) => {
	return (
		<div className="flex flex-col gap-4 px-6">
			<FormField
				control={form.control}
				name="title"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{labels.title}</FormLabel>
						<FormControl>
							<Input {...field} autoComplete="off" />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{labels.description}</FormLabel>
						<FormControl>
							<textarea
								{...field}
								rows={4}
								className={cn(
									'placeholder:text-muted-foreground border-border text-foreground w-full min-w-0 rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden',
									'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
								)}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormField
					control={form.control}
					name="goal"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{labels.goal}</FormLabel>
							<FormControl>
								<Input {...field} type="number" min={1} step="0.01" value={field.value ?? ''} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="currency"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{labels.currency}</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={labels.currencyPlaceholder} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{campaignSubmissionConfig.allowedCurrencies.map((currency) => (
										<SelectItem key={currency} value={currency}>
											{currency}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<FormField
				control={form.control}
				name="endDate"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{labels.endDate}</FormLabel>
						<FormControl>
							<Input
								{...field}
								type="date"
								min={format(addDays(new Date(), campaignSubmissionConfig.minCampaignDurationDays), 'yyyy-MM-dd')}
								max={format(addDays(new Date(), campaignSubmissionConfig.maxCampaignDurationDays), 'yyyy-MM-dd')}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<div className="flex flex-col gap-2">
				<Label htmlFor="campaign-primary-image" className={cn(imageError && 'text-destructive')}>
					{labels.primaryImage}
				</Label>
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
