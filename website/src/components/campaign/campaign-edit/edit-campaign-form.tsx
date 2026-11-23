'use client';

import { campaignSubmissionConfig } from '@/lib/campaign-submission';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import {
	getCampaignDefaultImagesAction,
	updateOwnCampaignAction,
	type CampaignDefaultImageOption,
} from '@/modules/campaigns/campaign.actions';
import { campaignSubmissionDetailsFieldNames, type EditableCampaign } from '@/modules/campaigns/campaign.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@socialincome/design-system/forms/form/form';
import { DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { CampaignSubmissionContributorSuccess } from '../campaign-submission/campaign-submission-contributor-success';
import { CampaignSubmissionFooter } from '../campaign-submission/campaign-submission-footer';
import {
	appendCampaignSubmissionFormData,
	createCampaignEditFormSchema,
	createCampaignSubmissionDetailsSchema,
	isCampaignSubmissionErrorCode,
	isCampaignSubmissionImageErrorCode,
} from '../campaign-submission/campaign-submission.client';
import { compressCampaignImage } from '../campaign-submission/compress-campaign-image';
import { CampaignSubmissionFormCard, CampaignSubmissionFormCardColumn } from '../campaign-submission/form-layout';
import { AboutStep } from '../campaign-submission/steps/about-step';
import { DetailsStep } from '../campaign-submission/steps/details-step';
import type {
	CampaignImageSelection,
	CampaignSubmissionFormValues,
	CampaignSubmissionImageUploadField,
	SubmissionLabels,
} from '../campaign-submission/types';
import { useCampaignImageUpload } from '../campaign-submission/use-campaign-image-upload';

export type EditCampaignLabels = SubmissionLabels & {
	save: string;
	saving: string;
	savedTitle: string;
	savedDescription: string;
};

type Props = {
	campaign: EditableCampaign;
	labels: EditCampaignLabels;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	onSaved: () => void;
};

const steps = ['details', 'about'] as const;

const toFormValues = (campaign: EditableCampaign): CampaignSubmissionFormValues => ({
	title: campaign.title,
	description: campaign.description,
	hasGoal: campaign.goal !== null,
	goal: campaign.goal === null ? '' : String(campaign.goal),
	currency: campaign.currency,
	durationPreset: 'other',
	endDate: campaign.endDate,
	isPublic: campaign.isPublic,
	programId: '',
	creatorName: campaign.creatorName,
	quote: campaign.quote,
	hasAdditionalInformation: [
		campaign.sectionDescription,
		campaign.sectionImageUrl,
		campaign.instagramHandle,
		campaign.xHandle,
		campaign.linkWebsite,
		campaign.tiktokHandle,
	].some(Boolean),
	sectionDescription: campaign.sectionDescription,
	instagramHandle: campaign.instagramHandle,
	xHandle: campaign.xHandle,
	linkWebsite: campaign.linkWebsite,
	tiktokHandle: campaign.tiktokHandle,
	firstName: '',
	lastName: '',
	email: '',
});

// A saved optional image stays until it is removed or replaced by an upload.
const useSavedImageField = (
	upload: ReturnType<typeof useCampaignImageUpload>,
	savedUrl: string | null,
): { field: CampaignSubmissionImageUploadField; removed: boolean } => {
	const [removed, setRemoved] = useState(false);

	return {
		removed: removed && !upload.file,
		field: {
			inputRef: upload.inputRef,
			previewUrl: upload.previewUrl ?? (removed ? null : savedUrl),
			focus: upload.focus,
			error: upload.error,
			onChange: (file) => {
				if (file) {
					upload.setFromFile(file);
				} else if (upload.file) {
					upload.clear();
				} else {
					setRemoved(true);
				}
			},
			setFocus: upload.file ? upload.setFocus : undefined,
			setError: upload.setError,
			clear: upload.clear,
		},
	};
};

export const EditCampaignForm = ({ campaign, labels, lang, currency, onSaved }: Props) => {
	const [currentStep, setCurrentStep] = useState<(typeof steps)[number]>('details');
	const [defaultImages, setDefaultImages] = useState<CampaignDefaultImageOption[]>([]);
	const [defaultImagesLoading, setDefaultImagesLoading] = useState(true);
	const [defaultImagesError, setDefaultImagesError] = useState<string | null>(null);
	const [selectedDefaultId, setSelectedDefaultId] = useState<number | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isSubmittingRef = useRef(false);
	const [saved, setSaved] = useState(false);

	const resolveError = useCallback(
		(code: string) => (isCampaignSubmissionErrorCode(code) ? labels.errors[code] : labels.error),
		[labels.error, labels.errors],
	);

	const primaryUpload = useCampaignImageUpload({ resolveError });
	const profileUpload = useCampaignImageUpload({ resolveError });
	const sectionUpload = useCampaignImageUpload({ resolveError });
	const profilePicture = useSavedImageField(profileUpload, campaign.profilePictureUrl);
	const sectionImage = useSavedImageField(sectionUpload, campaign.sectionImageUrl);

	const formSchema = useMemo(
		() => createCampaignEditFormSchema(resolveError, campaign.endDate),
		[resolveError, campaign.endDate],
	);
	const detailsSchema = useMemo(
		() => createCampaignSubmissionDetailsSchema(resolveError, campaign.endDate),
		[resolveError, campaign.endDate],
	);
	const form = useForm<CampaignSubmissionFormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: toFormValues(campaign),
	});

	useEffect(() => {
		let cancelled = false;

		const loadDefaultImages = async () => {
			const result = await getCampaignDefaultImagesAction().catch(() => null);
			if (cancelled) {
				return;
			}

			if (result?.success) {
				setDefaultImages(result.data);
			} else {
				setDefaultImagesError(labels.defaultImagesError);
			}
			setDefaultImagesLoading(false);
		};

		void loadDefaultImages();

		return () => {
			cancelled = true;
		};
	}, [labels.defaultImagesError]);

	const imageSelection: CampaignImageSelection = primaryUpload.file
		? { type: 'upload', file: primaryUpload.file }
		: selectedDefaultId !== null
			? { type: 'default', id: selectedDefaultId }
			: campaign.primaryImageUrl
				? { type: 'current', url: campaign.primaryImageUrl }
				: null;

	const primaryImage: CampaignSubmissionImageUploadField = {
		inputRef: primaryUpload.inputRef,
		previewUrl: primaryUpload.previewUrl,
		focus: primaryUpload.focus,
		error: primaryUpload.error,
		onChange: (file) => {
			primaryUpload.setFromFile(file);
			setSelectedDefaultId(null);
		},
		setFocus: primaryUpload.setFocus,
		setError: primaryUpload.setError,
		clear: () => {
			primaryUpload.clear();
			setSelectedDefaultId(null);
		},
	};

	const applySchemaErrors = (issues: { path: PropertyKey[]; message: string }[]) => {
		const values = form.getValues();
		const isFieldName = (path: PropertyKey | undefined): path is keyof CampaignSubmissionFormValues =>
			typeof path === 'string' && path in values;
		let firstFieldName: keyof CampaignSubmissionFormValues | undefined;
		for (const issue of issues) {
			const fieldName = issue.path[0];
			if (isFieldName(fieldName)) {
				form.setError(fieldName, { type: 'manual', message: issue.message });
				firstFieldName ??= fieldName;
			}
		}
		if (firstFieldName) {
			form.setFocus(firstFieldName);
		}
	};

	const onContinue = () => {
		form.clearErrors([...campaignSubmissionDetailsFieldNames]);
		const detailsResult = detailsSchema.safeParse(form.getValues());
		if (!detailsResult.success) {
			applySchemaErrors(detailsResult.error.issues);

			return;
		}
		if (!imageSelection) {
			primaryImage.setError(resolveError('image-required'));

			return;
		}
		if (primaryImage.error) {
			return;
		}

		setSubmitError(null);
		setCurrentStep('about');
	};

	const onSubmit = async (values: CampaignSubmissionFormValues) => {
		if (isSubmittingRef.current || primaryImage.error || profilePicture.field.error || sectionImage.field.error) {
			return;
		}

		isSubmittingRef.current = true;
		setSubmitError(null);
		setIsSubmitting(true);

		try {
			const [primaryCompressed, profileCompressed, sectionCompressed] = await Promise.all([
				primaryUpload.file ? compressCampaignImage({ file: primaryUpload.file, focus: primaryUpload.focus }) : undefined,
				profileUpload.file ? compressCampaignImage({ file: profileUpload.file, focus: profileUpload.focus }) : undefined,
				values.hasAdditionalInformation && sectionUpload.file
					? compressCampaignImage({ file: sectionUpload.file, focus: sectionUpload.focus })
					: undefined,
			]);
			const totalImageBytes = [primaryCompressed, profileCompressed, sectionCompressed].reduce(
				(total, image) => total + (image?.file.size ?? 0),
				0,
			);
			if (totalImageBytes > campaignSubmissionConfig.maxMultipartBodyBytes) {
				setSubmitError(resolveError('payload-too-large'));

				return;
			}

			const formData = appendCampaignSubmissionFormData(new FormData(), values, {
				primaryImage: primaryCompressed?.file,
				primaryImageFocus: primaryCompressed?.focus,
				defaultImageId: imageSelection?.type === 'default' ? imageSelection.id : undefined,
				profilePicture: profileCompressed?.file,
				profilePictureFocus: profileCompressed?.focus,
				sectionImage: sectionCompressed?.file,
				sectionImageFocus: sectionCompressed?.focus,
			});
			formData.append('campaignId', campaign.id);
			formData.append('removeProfilePicture', profilePicture.removed ? 'true' : 'false');
			formData.append('removeSectionImage', sectionImage.removed ? 'true' : 'false');

			const result = await updateOwnCampaignAction(formData);
			if (!result.success) {
				const errorMessage = resolveError(result.error);
				if (isCampaignSubmissionImageErrorCode(result.error) && result.field === 'profilePicture') {
					profilePicture.field.setError(errorMessage);
				} else if (isCampaignSubmissionImageErrorCode(result.error) && result.field === 'sectionImage') {
					sectionImage.field.setError(errorMessage);
				} else if (isCampaignSubmissionImageErrorCode(result.error)) {
					primaryImage.setError(errorMessage);
					setCurrentStep('details');
				} else {
					setSubmitError(errorMessage);
				}

				return;
			}

			setSaved(true);
			onSaved();
		} catch {
			setSubmitError(labels.error);
		} finally {
			isSubmittingRef.current = false;
			setIsSubmitting(false);
		}
	};

	if (saved) {
		return (
			<CampaignSubmissionContributorSuccess
				labels={{ successCreatedTitle: labels.savedTitle, successLiveTitle: labels.savedDescription }}
				campaignHref={getWebsitePublicPath(lang, currency, `campaigns/${campaign.slug}`)}
			/>
		);
	}

	const submit = () => {
		void form.handleSubmit(onSubmit, (errors) => {
			if (campaignSubmissionDetailsFieldNames.some((fieldName) => fieldName in errors)) {
				setCurrentStep('details');
			}
		})();
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (currentStep === 'details') {
			onContinue();

			return;
		}
		submit();
	};

	return (
		<Form {...form}>
			<form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleSubmit}>
				<DialogHeader>
					<DialogTitle>{currentStep === 'details' ? labels.detailsStepTitle : labels.aboutStepTitle}</DialogTitle>
				</DialogHeader>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
					<CampaignSubmissionFormCardColumn key={currentStep}>
						{currentStep === 'details' ? (
							<CampaignSubmissionFormCard>
								<DetailsStep
									form={form}
									labels={labels}
									primaryImage={primaryImage}
									imageSelection={imageSelection}
									defaultImages={defaultImages}
									defaultImagesLoading={defaultImagesLoading}
									defaultImagesError={defaultImagesError}
									onSelectDefaultImage={(id) => {
										primaryUpload.clear();
										setSelectedDefaultId(id);
									}}
								/>
							</CampaignSubmissionFormCard>
						) : (
							<AboutStep
								form={form}
								labels={labels}
								profilePicture={profilePicture.field}
								sectionImage={sectionImage.field}
								isSubmitting={isSubmitting}
								submitError={submitError}
							/>
						)}
					</CampaignSubmissionFormCardColumn>
				</div>
				<div className="shrink-0">
					<CampaignSubmissionFooter
						currentStep={currentStep}
						visibleSteps={steps}
						labels={{ ...labels, submit: labels.save, submitting: labels.saving }}
						isContinueDisabled={false}
						isSubmitting={isSubmitting}
						onContinue={onContinue}
						onBack={() => {
							form.clearErrors();
							setSubmitError(null);
							setCurrentStep('details');
						}}
						onSubmit={submit}
					/>
				</div>
			</form>
		</Form>
	);
};
