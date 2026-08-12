'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input/input';
import { Label } from '@/components/label';
import { Switch } from '@/components/switch';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { cn } from '@/lib/utils/cn';
import { Camera, Trash2, Upload } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import type { CampaignSubmissionFormValues, CampaignSubmissionStepProps } from '../types';

type Props = Pick<
	CampaignSubmissionStepProps,
	| 'form'
	| 'labels'
	| 'profilePictureInputRef'
	| 'profilePicture'
	| 'sectionImageInputRef'
	| 'sectionImage'
	| 'submitError'
	| 'isSubmitting'
>;

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

export const AboutStep = ({
	form,
	labels,
	profilePictureInputRef,
	profilePicture,
	sectionImageInputRef,
	sectionImage,
	submitError,
	isSubmitting,
}: Props) => {
	const profileHintId = useId();
	const profileErrorId = useId();
	const sectionHintId = useId();
	const sectionErrorId = useId();
	const profileErrorRef = useRef<HTMLParagraphElement>(null);
	const sectionErrorRef = useRef<HTMLParagraphElement>(null);
	const submitErrorRef = useRef<HTMLParagraphElement>(null);
	const hasAdditionalInformation = form.watch('hasAdditionalInformation');

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
		if (profilePicture.error) {
			profileErrorRef.current?.scrollIntoView({ block: 'nearest' });
			profileErrorRef.current?.focus();

			return;
		}

		if (sectionImage.error) {
			sectionErrorRef.current?.scrollIntoView({ block: 'nearest' });
			sectionErrorRef.current?.focus();

			return;
		}

		if (submitError) {
			submitErrorRef.current?.scrollIntoView({ block: 'nearest' });
			submitErrorRef.current?.focus();
		}
	}, [profilePicture.error, sectionImage.error, submitError]);

	return (
		<div className="flex flex-col gap-6 px-6">
			<FormField
				control={form.control}
				name="creatorName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{labels.aboutStepSubtitle}</FormLabel>
						<FormControl>
							<Input {...field} autoComplete="name" placeholder={labels.creatorNamePlaceholder} disabled={isSubmitting} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<p className="text-muted-foreground -mt-2 text-sm">{labels.aboutStepDescription}</p>

			<div className="flex flex-col gap-3">
				<Label className={cn(profilePicture.error && 'text-destructive')}>{labels.profilePicture}</Label>
				<div className="border-border relative aspect-[16/10] w-full rounded-2xl border border-dashed">
					<button
						type="button"
						disabled={isSubmitting}
						className="hover:bg-muted/40 focus-visible:ring-ring absolute inset-0 rounded-2xl focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						aria-label={profilePicture.previewUrl ? labels.editProfilePicture : labels.profilePicture}
						aria-describedby={[profileHintId, profilePicture.error ? profileErrorId : null].filter(Boolean).join(' ')}
						onClick={() => profilePictureInputRef.current?.click()}
					/>
					<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
						{profilePicture.previewUrl ? (
							<span className="border-primary size-32 overflow-hidden rounded-full border-2">
								{/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
								<img src={profilePicture.previewUrl} alt="" className="size-full object-cover" />
							</span>
						) : (
							<>
								<span className="bg-muted text-muted-foreground flex size-32 items-center justify-center rounded-full">
									<Camera className="size-8" aria-hidden />
								</span>
								<span className="text-muted-foreground text-sm">{labels.profilePictureHint}</span>
							</>
						)}
					</div>
					{profilePicture.previewUrl ? (
						<button
							type="button"
							disabled={isSubmitting}
							className="bg-background text-foreground hover:bg-muted absolute top-2 right-2 flex size-8 items-center justify-center rounded-full border shadow-xs disabled:pointer-events-none disabled:opacity-50"
							aria-label={labels.removeUploadedImage}
							onClick={() => profilePicture.onChange(null)}
						>
							<Trash2 className="size-3.5" aria-hidden />
						</button>
					) : null}
				</div>
				<input
					ref={profilePictureInputRef}
					type="file"
					accept={campaignSubmissionConfig.permittedImageMimeTypes.join(',')}
					className="sr-only"
					tabIndex={-1}
					disabled={isSubmitting}
					onChange={(event) => {
						profilePicture.onChange(event.target.files?.[0] ?? null);
					}}
				/>
				<p id={profileHintId} className="text-muted-foreground text-xs">
					{labels.imageHint}
				</p>
				{profilePicture.error ? (
					<p
						id={profileErrorId}
						ref={profileErrorRef}
						className="text-destructive text-sm outline-none"
						role="alert"
						tabIndex={-1}
					>
						{profilePicture.error}
					</p>
				) : null}
			</div>

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
								className={cn(
									'placeholder:text-muted-foreground border-border text-foreground w-full min-w-0 rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden',
									'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
									'disabled:opacity-50',
								)}
							/>
						</FormControl>
						<p className="text-muted-foreground text-xs">{labels.quoteHint}</p>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="flex flex-col gap-3">
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
					<div className="flex flex-col gap-6">
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
											className={cn(
												'placeholder:text-muted-foreground border-border text-foreground w-full min-w-0 rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden',
												'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
												'disabled:opacity-50',
											)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex flex-col gap-3">
							<Label className={cn(sectionImage.error && 'text-destructive')}>{labels.sectionImage}</Label>
							{sectionImage.previewUrl ? (
								<div className="border-border relative aspect-[16/10] w-full overflow-hidden rounded-2xl border">
									{/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
									<img src={sectionImage.previewUrl} alt="" className="size-full object-cover" />
									<button
										type="button"
										disabled={isSubmitting}
										className="bg-background text-foreground hover:bg-muted absolute top-2 right-2 flex size-8 items-center justify-center rounded-full border shadow-xs disabled:pointer-events-none disabled:opacity-50"
										aria-label={labels.removeUploadedImage}
										onClick={() => sectionImage.onChange(null)}
									>
										<Trash2 className="size-3.5" aria-hidden />
									</button>
								</div>
							) : (
								<button
									type="button"
									disabled={isSubmitting}
									className="border-border text-muted-foreground hover:bg-muted/40 flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed disabled:pointer-events-none disabled:opacity-50"
									aria-label={labels.sectionImage}
									aria-describedby={[sectionHintId, sectionImage.error ? sectionErrorId : null].filter(Boolean).join(' ')}
									onClick={() => sectionImageInputRef.current?.click()}
								>
									<Upload className="size-6" aria-hidden />
									<span className="text-sm">{labels.uploadImage}</span>
								</button>
							)}
							<input
								ref={sectionImageInputRef}
								type="file"
								accept={campaignSubmissionConfig.permittedImageMimeTypes.join(',')}
								className="sr-only"
								tabIndex={-1}
								disabled={isSubmitting}
								onChange={(event) => {
									sectionImage.onChange(event.target.files?.[0] ?? null);
								}}
							/>
							<p id={sectionHintId} className="text-muted-foreground text-xs">
								{labels.imageHint}
							</p>
							{sectionImage.error ? (
								<p
									id={sectionErrorId}
									ref={sectionErrorRef}
									className="text-destructive text-sm outline-none"
									role="alert"
									tabIndex={-1}
								>
									{sectionImage.error}
								</p>
							) : null}
						</div>

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
					</div>
				) : null}
			</div>

			{submitError ? (
				<p ref={submitErrorRef} className="text-destructive text-sm outline-none" role="alert" tabIndex={-1}>
					{submitError}
				</p>
			) : null}
		</div>
	);
};
