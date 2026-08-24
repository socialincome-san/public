'use client';

import { RadioCard } from '@/components/create-program-wizard/radio-card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input/input';
import { Label } from '@/components/label';
import { RadioGroup } from '@/components/radio-group/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select/select';
import { Switch } from '@/components/switch';
import { campaignSubmissionConfig, type CampaignSubmissionDurationPreset } from '@/lib/config/campaign-submission.config';
import { endDateFromDurationPreset } from '@/lib/services/campaign/campaign-submission-input';
import { cn } from '@/lib/utils/cn';
import { addDays, format } from 'date-fns';
import { Camera, Check, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import type { DetailsStepProps } from '../types';

type Props = DetailsStepProps;

const durationOptions: {
	value: CampaignSubmissionDurationPreset;
	labelKey: 'duration30' | 'duration90' | 'duration365' | 'durationOther';
}[] = [
	{ value: '30', labelKey: 'duration30' },
	{ value: '90', labelKey: 'duration90' },
	{ value: '365', labelKey: 'duration365' },
	{ value: 'other', labelKey: 'durationOther' },
];

const RemoveUploadedImageButton = ({
	ariaLabel,
	className,
	onRemove,
}: {
	ariaLabel: string;
	className?: string;
	onRemove: () => void;
}) => (
	<button
		type="button"
		className={cn(
			'bg-background text-foreground hover:bg-muted absolute top-1 right-1 z-10 flex items-center justify-center rounded-full border shadow-xs',
			className,
		)}
		aria-label={ariaLabel}
		onClick={(event) => {
			event.stopPropagation();
			onRemove();
		}}
	>
		<Trash2 className="size-3" aria-hidden />
	</button>
);

export const DetailsStep = ({
	form,
	labels,
	primaryImage,
	imageSelection,
	defaultImages,
	defaultImagesLoading,
	defaultImagesError,
	onSelectDefaultImage,
}: Props) => {
	const { inputRef, previewUrl, error: imageError, onChange: onPrimaryImageChange } = primaryImage;
	const imageHintId = useId();
	const imageErrorId = useId();
	const imageErrorRef = useRef<HTMLParagraphElement>(null);
	const durationPreset = form.watch('durationPreset');
	const hasGoal = form.watch('hasGoal');
	const isPublic = form.watch('isPublic');

	useEffect(() => {
		if (imageError) {
			imageErrorRef.current?.scrollIntoView({ block: 'nearest' });
			imageErrorRef.current?.focus();
		}
	}, [imageError]);

	const imageDescribedBy = [imageHintId, imageError ? imageErrorId : null].filter(Boolean).join(' ');

	const previewSrc =
		imageSelection?.type === 'upload'
			? previewUrl
			: imageSelection?.type === 'default'
				? (defaultImages.find((image) => image.id === imageSelection.id)?.url ?? null)
				: null;

	const setDurationPreset = (preset: CampaignSubmissionDurationPreset) => {
		form.setValue('durationPreset', preset, { shouldDirty: true, shouldValidate: true });
		if (preset !== 'other') {
			form.setValue('endDate', endDateFromDurationPreset(preset), { shouldDirty: true, shouldValidate: true });
		}
	};

	return (
		<div className="flex flex-col gap-6">
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

			<div className="flex flex-col gap-3">
				<Label>{labels.duration}</Label>
				<div className="flex flex-wrap gap-2" role="group" aria-label={labels.duration}>
					{durationOptions.map((option) => {
						const selected = durationPreset === option.value;

						return (
							<button
								key={option.value}
								type="button"
								className={cn(
									'rounded-full border px-3 py-1.5 text-sm transition-colors',
									selected
										? 'border-primary bg-primary text-primary-foreground'
										: 'border-border text-foreground hover:bg-muted/40',
								)}
								aria-pressed={selected}
								onClick={() => setDurationPreset(option.value)}
							>
								{labels[option.labelKey]}
							</button>
						);
					})}
				</div>
				{durationPreset === 'other' ? (
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
				) : (
					<input type="hidden" {...form.register('endDate')} />
				)}
			</div>

			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-3">
					<Label htmlFor="campaign-has-goal">{labels.setGoalAmount}</Label>
					<Switch
						id="campaign-has-goal"
						checked={hasGoal}
						onCheckedChange={(checked) => {
							form.setValue('hasGoal', checked, { shouldDirty: true, shouldValidate: true });
							if (!checked) {
								form.setValue('goal', '', { shouldDirty: true, shouldValidate: true });
								form.clearErrors('goal');
							}
						}}
					/>
				</div>
				{hasGoal ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="goal"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{labels.goal}</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											min={1}
											step="0.01"
											value={field.value ?? ''}
											onChange={(event) => field.onChange(event.target.value)}
										/>
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
				) : (
					<input type="hidden" {...form.register('currency')} />
				)}
			</div>

			<div className="flex flex-col gap-3">
				<Label>{labels.access}</Label>
				<RadioGroup
					value={isPublic ? 'public' : 'private'}
					onValueChange={(value) => {
						form.setValue('isPublic', value === 'public', { shouldDirty: true, shouldValidate: true });
					}}
					className="flex flex-col gap-2"
				>
					<RadioCard
						value="public"
						checked={isPublic}
						label={<span className="font-medium">{labels.accessPublic}</span>}
						description={labels.accessPublicDescription}
						badge={
							<span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
								{labels.accessRecommended}
							</span>
						}
					/>
					<RadioCard
						value="private"
						checked={!isPublic}
						label={<span className="font-medium">{labels.accessPrivate}</span>}
						description={labels.accessPrivateDescription}
					/>
				</RadioGroup>
			</div>

			<div className="flex flex-col gap-3">
				<Label className={cn(imageError && 'text-destructive')}>{labels.campaignBackground}</Label>

				{previewSrc ? (
					<div className="border-border relative aspect-[16/10] w-full overflow-hidden rounded-2xl border">
						{/* eslint-disable-next-line @next/next/no-img-element -- blob and Storyblok CDN previews */}
						<img src={previewSrc} alt="" className="size-full object-cover" />
						{imageSelection?.type === 'upload' ? (
							<RemoveUploadedImageButton
								ariaLabel={labels.removeUploadedImage}
								className="size-8"
								onRemove={() => onPrimaryImageChange(null)}
							/>
						) : null}
					</div>
				) : null}

				<div
					className="flex flex-wrap gap-2"
					role="radiogroup"
					aria-label={labels.campaignBackground}
					aria-invalid={Boolean(imageError)}
					aria-describedby={imageDescribedBy}
				>
					<div
						className={cn(
							'border-border text-muted-foreground relative size-20 shrink-0 rounded-xl border border-dashed text-xs',
							imageSelection?.type === 'upload' && 'border-primary ring-primary/30 ring-2',
						)}
					>
						<button
							type="button"
							className="hover:bg-muted/40 flex size-full flex-col items-center justify-center gap-1 rounded-xl"
							aria-checked={imageSelection?.type === 'upload'}
							role="radio"
							onClick={() => inputRef.current?.click()}
						>
							{previewUrl && imageSelection?.type === 'upload' ? (
								/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */
								<img src={previewUrl} alt="" className="absolute inset-0 size-full rounded-xl object-cover" />
							) : (
								<>
									<Camera className="size-5" aria-hidden />
									<span className="px-1 text-center leading-tight">{labels.uploadImage}</span>
								</>
							)}
						</button>
						{previewUrl && imageSelection?.type === 'upload' ? (
							<RemoveUploadedImageButton
								ariaLabel={labels.removeUploadedImage}
								className="size-5"
								onRemove={() => onPrimaryImageChange(null)}
							/>
						) : null}
					</div>

					{defaultImagesLoading ? (
						<p className="text-muted-foreground self-center text-sm">{labels.defaultImagesLoading}</p>
					) : null}
					{defaultImagesError ? <p className="text-destructive self-center text-sm">{defaultImagesError}</p> : null}

					{defaultImages.map((image) => {
						const selected = imageSelection?.type === 'default' && imageSelection.id === image.id;

						return (
							<button
								key={image.id}
								type="button"
								className={cn(
									'border-border relative size-20 shrink-0 overflow-hidden rounded-xl border',
									selected && 'border-primary ring-primary/30 ring-2',
								)}
								aria-checked={selected}
								role="radio"
								onClick={() => onSelectDefaultImage(image.id)}
							>
								{/* eslint-disable-next-line @next/next/no-img-element -- Storyblok CDN thumbnail */}
								<img src={image.url} alt={image.alt ?? ''} className="size-full object-cover" />
								{selected ? (
									<span className="bg-primary absolute top-1 right-1 flex size-5 items-center justify-center rounded-full text-white">
										<Check className="size-3" aria-hidden />
									</span>
								) : null}
							</button>
						);
					})}
				</div>

				<input
					id="campaign-primary-image"
					ref={inputRef}
					type="file"
					accept={campaignSubmissionConfig.permittedImageMimeTypes.join(',')}
					className="sr-only"
					tabIndex={-1}
					onChange={(event) => {
						onPrimaryImageChange(event.target.files?.[0] ?? null);
					}}
				/>
				<p id={imageHintId} className="text-muted-foreground text-xs">
					{labels.imageHint}
				</p>
				{imageError ? (
					<p
						id={imageErrorId}
						ref={imageErrorRef}
						className="text-destructive text-sm outline-none"
						role="alert"
						tabIndex={-1}
					>
						{imageError}
					</p>
				) : null}
			</div>
		</div>
	);
};
