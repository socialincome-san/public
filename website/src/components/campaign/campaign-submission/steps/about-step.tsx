'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input/input';
import { Label } from '@/components/label';
import { Switch } from '@/components/switch/switch';
import { cn } from '@/lib/utils/cn';
import { useEffect, useRef } from 'react';
import { CampaignSubmissionFormCard } from '../form-layout';
import { ImageUploadField } from '../image-upload-field';
import { TurnstileWidget } from '../turnstile/turnstile-widget';
import type { AboutStepProps, CampaignSubmissionFormValues } from '../types';

type AdditionalLinkField = {
	name: keyof Pick<CampaignSubmissionFormValues, 'instagramHandle' | 'xHandle' | 'linkWebsite' | 'tiktokHandle'>;
	label: string;
	autoComplete: string;
	placeholder?: string;
};

const ADDITIONAL_FIELD_NAMES = [
	'sectionDescription',
	'instagramHandle',
	'xHandle',
	'linkWebsite',
	'tiktokHandle',
] as const satisfies readonly (keyof CampaignSubmissionFormValues)[];

const textareaClassName = cn(
	'placeholder:text-muted-foreground border-border text-foreground w-full min-w-0 rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden',
	'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
	'disabled:opacity-50',
);

export const AboutStep = ({
	form,
	labels,
	profilePicture,
	sectionImage,
	submitError,
	isSubmitting,
	lang,
	turnstileSiteKey,
	turnstileWidgetKey,
	onTurnstileTokenChange,
}: AboutStepProps) => {
	const submitErrorRef = useRef<HTMLParagraphElement>(null);
	const hasAdditionalInformation = form.watch('hasAdditionalInformation');
	const showTurnstile = Boolean(turnstileSiteKey && lang && onTurnstileTokenChange);

	const additionalLinkFields: AdditionalLinkField[] = [
		{
			name: 'instagramHandle',
			label: labels.instagramHandle,
			autoComplete: 'off',
			placeholder: labels.instagramHandlePlaceholder,
		},
		{ name: 'xHandle', label: labels.xHandle, autoComplete: 'off', placeholder: labels.xHandlePlaceholder },
		{ name: 'linkWebsite', label: labels.linkWebsite, autoComplete: 'url' },
		{ name: 'tiktokHandle', label: labels.tiktokHandle, autoComplete: 'off', placeholder: labels.tiktokHandlePlaceholder },
	];

	useEffect(() => {
		if (submitError) {
			submitErrorRef.current?.scrollIntoView({ block: 'nearest' });
			submitErrorRef.current?.focus();
		}
	}, [submitError]);

	return (
		<>
			<CampaignSubmissionFormCard>
				<div className="flex flex-col gap-6">
					<FormField
						control={form.control}
						name="creatorName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{labels.aboutStepSubtitle}</FormLabel>
								<FormControl>
									<Input
										{...field}
										autoComplete="name"
										placeholder={labels.creatorNamePlaceholder}
										disabled={isSubmitting}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<p className="text-muted-foreground -mt-2 text-sm">{labels.aboutStepDescription}</p>

					<ImageUploadField
						variant="avatar"
						label={labels.profilePicture}
						previewUrl={profilePicture.previewUrl}
						error={profilePicture.error}
						inputRef={profilePicture.inputRef}
						onChange={profilePicture.onChange}
						disabled={isSubmitting}
						hint={labels.imageHint}
						uploadLabel={labels.profilePictureHint}
						editLabel={labels.editProfilePicture}
						removeLabel={labels.removeUploadedImage}
					/>

					<FormField
						control={form.control}
						name="quote"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{labels.quote}</FormLabel>
								<FormControl>
									<textarea
										{...field}
										rows={3}
										placeholder={labels.quotePlaceholder}
										disabled={isSubmitting}
										className={textareaClassName}
									/>
								</FormControl>
								<p className="text-muted-foreground text-xs">{labels.quoteHint}</p>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</CampaignSubmissionFormCard>

			<CampaignSubmissionFormCard>
				<div className="flex flex-col gap-6">
					<div className="flex items-center justify-between gap-3">
						<Label htmlFor="campaign-has-additional-information">{labels.hasAdditionalInformation}</Label>
						<Switch
							id="campaign-has-additional-information"
							checked={hasAdditionalInformation}
							disabled={isSubmitting}
							onCheckedChange={(checked) => {
								form.setValue('hasAdditionalInformation', checked, { shouldDirty: true, shouldValidate: true });
								if (!checked) {
									for (const fieldName of ADDITIONAL_FIELD_NAMES) {
										form.setValue(fieldName, '', { shouldDirty: true, shouldValidate: true });
									}
									form.clearErrors([...ADDITIONAL_FIELD_NAMES]);
									sectionImage.onChange(null);
								}
							}}
						/>
					</div>

					{hasAdditionalInformation ? (
						<>
							<FormField
								control={form.control}
								name="sectionDescription"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{labels.sectionDescription}</FormLabel>
										<FormControl>
											<textarea
												{...field}
												value={field.value ?? ''}
												rows={4}
												disabled={isSubmitting}
												className={textareaClassName}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<ImageUploadField
								variant="cover"
								label={labels.sectionImage}
								previewUrl={sectionImage.previewUrl}
								error={sectionImage.error}
								inputRef={sectionImage.inputRef}
								onChange={sectionImage.onChange}
								disabled={isSubmitting}
								hint={labels.imageHint}
								uploadLabel={labels.uploadImage}
								removeLabel={labels.removeUploadedImage}
							/>

							{additionalLinkFields.map(({ name, label, autoComplete, placeholder }) => (
								<FormField
									key={name}
									control={form.control}
									name={name}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{label}</FormLabel>
											<FormControl>
												<Input
													{...field}
													value={field.value ?? ''}
													autoComplete={autoComplete}
													placeholder={placeholder}
													disabled={isSubmitting}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							))}
						</>
					) : null}
				</div>
			</CampaignSubmissionFormCard>

			{showTurnstile && turnstileSiteKey && lang && onTurnstileTokenChange ? (
				<TurnstileWidget
					key={turnstileWidgetKey}
					siteKey={turnstileSiteKey}
					language={lang}
					onTokenChange={onTurnstileTokenChange}
				/>
			) : null}

			{submitError ? (
				<p ref={submitErrorRef} className="text-destructive text-sm outline-none" role="alert" tabIndex={-1}>
					{submitError}
				</p>
			) : null}
		</>
	);
};
