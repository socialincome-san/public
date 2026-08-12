'use client';

import { DialogHeader, DialogTitle } from '@/components/dialog';
import { Form } from '@/components/form';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import {
	getCampaignDefaultImagesAction,
	getEligiblePublicSubmissionProgramsAction,
	type CampaignDefaultImageOption,
} from '@/lib/server-actions/campaign-public-actions';
import {
	appendCampaignSubmissionFormData,
	campaignSubmissionDefaultCurrency,
	campaignSubmissionDetailsFieldNames,
	createCampaignSubmissionFormSchema,
	endDateFromDurationPreset,
	isCampaignSubmissionErrorCode,
	isCampaignSubmissionImageErrorCode,
	isCampaignSubmissionImageMultipartField,
	toCampaignSubmissionWirePayload,
	validateCampaignSubmissionImageMeta,
} from '@/lib/services/campaign/campaign-submission-input';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { CampaignSubmissionFooter } from './campaign-submission-footer';
import { CampaignSubmissionStepIndicator } from './campaign-submission-step-indicator';
import { CampaignSubmissionSteps } from './campaign-submission-steps';
import type {
	CampaignImageSelection,
	CampaignSubmissionFormValues,
	CampaignSubmissionStepId,
	SubmissionLabels,
} from './types';
import { useCampaignImageUpload } from './use-campaign-image-upload';

type Props = {
	labels: SubmissionLabels;
	lang: WebsiteLanguage;
	onSuccess?: () => void;
};

const defaultFormValues = (): CampaignSubmissionFormValues => ({
	title: '',
	description: '',
	hasGoal: false,
	goal: '',
	currency: campaignSubmissionDefaultCurrency,
	durationPreset: '30',
	endDate: endDateFromDurationPreset('30'),
	isPublic: true,
	programId: '',
	creatorName: '',
	quote: '',
	hasAdditionalInformation: false,
	sectionDescription: '',
	instagramHandle: '',
	xHandle: '',
	linkWebsite: '',
	tiktokHandle: '',
});
export const CampaignSubmissionForm = ({ labels, lang, onSuccess }: Props) => {
	const [currentStep, setCurrentStep] = useState<CampaignSubmissionStepId>('program');
	const [programs, setPrograms] = useState<PublicSubmissionProgramOption[]>([]);
	const [programsLoading, setProgramsLoading] = useState(true);
	const [programsError, setProgramsError] = useState<string | null>(null);
	const [defaultImages, setDefaultImages] = useState<CampaignDefaultImageOption[]>([]);
	const [defaultImagesLoading, setDefaultImagesLoading] = useState(false);
	const [defaultImagesError, setDefaultImagesError] = useState<string | null>(null);
	const [imageSelection, setImageSelection] = useState<CampaignImageSelection>(null);
	const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
	const [imageError, setImageError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isSubmittingRef = useRef(false);
	const primaryImageInputRef = useRef<HTMLInputElement>(null);
	const stepTitleRef = useRef<HTMLHeadingElement>(null);
	const hasMountedStep = useRef(false);
	const uploadPreviewUrlRef = useRef<string | null>(null);

	const resolveError = useCallback(
		(code: string) => {
			if (isCampaignSubmissionErrorCode(code)) {
				return labels.errors[code];
			}

			return labels.error;
		},
		[labels.error, labels.errors],
	);

	const profilePicture = useCampaignImageUpload({ resolveError });
	const sectionImage = useCampaignImageUpload({ resolveError });

	const formSchema = useMemo(() => createCampaignSubmissionFormSchema(resolveError), [resolveError]);

	const form = useForm<CampaignSubmissionFormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: defaultFormValues(),
	});

	const revokeUploadPreview = useCallback(() => {
		if (uploadPreviewUrlRef.current) {
			URL.revokeObjectURL(uploadPreviewUrlRef.current);
			uploadPreviewUrlRef.current = null;
		}
		setUploadPreviewUrl(null);
	}, []);

	const clearImageSelection = useCallback(() => {
		revokeUploadPreview();
		setImageSelection(null);
		setImageError(null);
		if (primaryImageInputRef.current) {
			primaryImageInputRef.current.value = '';
		}
	}, [revokeUploadPreview]);

	useEffect(() => {
		return () => {
			if (uploadPreviewUrlRef.current) {
				URL.revokeObjectURL(uploadPreviewUrlRef.current);
			}
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		const loadPrograms = async () => {
			setProgramsLoading(true);
			setProgramsError(null);

			try {
				const result = await getEligiblePublicSubmissionProgramsAction(lang);
				if (cancelled) {
					return;
				}

				if (!result.success) {
					setPrograms([]);
					setProgramsError(labels.error);

					return;
				}

				setPrograms(result.data);
				setProgramsError(null);
			} catch {
				if (cancelled) {
					return;
				}

				setPrograms([]);
				setProgramsError(labels.error);
			} finally {
				if (!cancelled) {
					setProgramsLoading(false);
				}
			}
		};

		void loadPrograms();

		return () => {
			cancelled = true;
		};
	}, [labels.error, lang]);

	useEffect(() => {
		if (currentStep !== 'details' || defaultImages.length > 0) {
			return;
		}

		let cancelled = false;

		const loadDefaultImages = async () => {
			setDefaultImagesLoading(true);
			setDefaultImagesError(null);

			try {
				const result = await getCampaignDefaultImagesAction();
				if (cancelled) {
					return;
				}

				if (!result.success) {
					setDefaultImages([]);
					setDefaultImagesError(labels.defaultImagesError);
					setImageSelection((current) => (current?.type === 'upload' ? current : null));

					return;
				}

				setDefaultImages(result.data);
				setDefaultImagesError(null);
				setImageSelection((current) => {
					if (current !== null) {
						return current;
					}

					const firstDefault = result.data[0];

					return firstDefault ? { type: 'default', id: firstDefault.id } : null;
				});
			} catch {
				if (cancelled) {
					return;
				}

				setDefaultImages([]);
				setDefaultImagesError(labels.defaultImagesError);
				setImageSelection((current) => (current?.type === 'upload' ? current : null));
			} finally {
				if (!cancelled) {
					setDefaultImagesLoading(false);
				}
			}
		};

		void loadDefaultImages();

		return () => {
			cancelled = true;
		};
	}, [currentStep, defaultImages.length, labels.defaultImagesError]);

	useEffect(() => {
		if (!hasMountedStep.current) {
			hasMountedStep.current = true;

			return;
		}

		stepTitleRef.current?.focus();
	}, [currentStep]);

	const isContinueDisabled =
		currentStep === 'program'
			? programsLoading || programs.length === 0 || Boolean(programsError)
			: currentStep === 'details'
				? defaultImagesLoading && imageSelection?.type !== 'upload'
				: false;
	const isSubmitDisabled = isSubmitting;

	const onSelectDefaultImage = (id: number) => {
		revokeUploadPreview();
		if (primaryImageInputRef.current) {
			primaryImageInputRef.current.value = '';
		}
		setImageSelection({ type: 'default', id });
		setImageError(null);
	};

	const onImageChange = (file: File | null) => {
		if (!file) {
			revokeUploadPreview();
			if (primaryImageInputRef.current) {
				primaryImageInputRef.current.value = '';
			}
			setImageError(null);
			const firstDefault = defaultImages[0];
			if (firstDefault) {
				setImageSelection({ type: 'default', id: firstDefault.id });
			} else {
				setImageSelection(null);
			}

			return;
		}

		const metaError = validateCampaignSubmissionImageMeta(file.size, file.type);
		if (metaError) {
			setImageError(resolveError(metaError));
			setImageSelection({ type: 'upload', file });
			revokeUploadPreview();
			const objectUrl = URL.createObjectURL(file);
			uploadPreviewUrlRef.current = objectUrl;
			setUploadPreviewUrl(objectUrl);

			return;
		}

		revokeUploadPreview();
		const objectUrl = URL.createObjectURL(file);
		uploadPreviewUrlRef.current = objectUrl;
		setUploadPreviewUrl(objectUrl);
		setImageSelection({ type: 'upload', file });
		setImageError(null);
	};

	const onContinue = async () => {
		if (currentStep === 'program') {
			const programId = form.getValues('programId').trim();
			if (!programId) {
				form.setError('programId', {
					type: 'manual',
					message: resolveError('program-required'),
				});
				form.setFocus('programId');

				return;
			}

			form.clearErrors();
			setImageError(null);
			setSubmitError(null);
			setCurrentStep('details');

			return;
		}

		if (currentStep === 'details') {
			const isValid = await form.trigger([...campaignSubmissionDetailsFieldNames]);
			if (!isValid) {
				return;
			}

			if (defaultImagesLoading && imageSelection?.type !== 'upload') {
				return;
			}

			if (!imageSelection) {
				setImageError(resolveError('image-required'));

				return;
			}

			if (imageSelection.type === 'upload') {
				const metaError = validateCampaignSubmissionImageMeta(imageSelection.file.size, imageSelection.file.type);
				if (metaError) {
					setImageError(resolveError(metaError));

					return;
				}
			}

			setImageError(null);
			setSubmitError(null);
			setCurrentStep('about');
		}
	};

	const onBack = () => {
		if (isSubmittingRef.current) {
			return;
		}

		form.clearErrors();
		setSubmitError(null);
		profilePicture.setError(null);
		sectionImage.setError(null);

		if (currentStep === 'about') {
			setCurrentStep('details');

			return;
		}

		if (currentStep === 'details') {
			setCurrentStep('program');
		}
	};

	const onSubmit = async (values: CampaignSubmissionFormValues) => {
		if (isSubmittingRef.current) {
			return;
		}

		setSubmitError(null);
		setSubmitSuccess(false);
		profilePicture.setError(null);
		sectionImage.setError(null);

		if (!imageSelection) {
			setImageError(resolveError('image-required'));
			setCurrentStep('details');

			return;
		}

		if (imageSelection.type === 'upload') {
			const metaError = validateCampaignSubmissionImageMeta(imageSelection.file.size, imageSelection.file.type);
			if (metaError) {
				setImageError(resolveError(metaError));
				setCurrentStep('details');

				return;
			}
		}

		if (!profilePicture.validate()) {
			return;
		}

		if (values.hasAdditionalInformation && !sectionImage.validate()) {
			return;
		}

		isSubmittingRef.current = true;
		setImageError(null);
		setIsSubmitting(true);

		try {
			const formData = appendCampaignSubmissionFormData(new FormData(), toCampaignSubmissionWirePayload(values), {
				primaryImage: imageSelection.type === 'upload' ? imageSelection.file : undefined,
				defaultImageId: imageSelection.type === 'default' ? imageSelection.id : undefined,
				profilePicture: profilePicture.file ?? undefined,
				sectionImage: values.hasAdditionalInformation ? (sectionImage.file ?? undefined) : undefined,
			});

			const response = await fetch('/api/campaign-submissions', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as {
					errorCode?: string;
					field?: string;
				} | null;
				const errorMessage = payload?.errorCode ? resolveError(payload.errorCode) : labels.error;
				const field = isCampaignSubmissionImageMultipartField(payload?.field) ? payload.field : undefined;

				if (isCampaignSubmissionImageErrorCode(payload?.errorCode)) {
					if (field === 'profilePicture') {
						profilePicture.setError(errorMessage);
					} else if (field === 'sectionImage') {
						sectionImage.setError(errorMessage);
					} else {
						setImageError(errorMessage);
						setCurrentStep('details');
					}
				} else {
					setSubmitError(errorMessage);
				}

				return;
			}

			setSubmitSuccess(true);
			form.reset(defaultFormValues());
			clearImageSelection();
			profilePicture.clear();
			sectionImage.clear();
			setDefaultImages([]);
			setCurrentStep('program');
			onSuccess?.();
		} catch {
			setSubmitError(labels.error);
		} finally {
			isSubmittingRef.current = false;
			setIsSubmitting(false);
		}
	};

	if (submitSuccess) {
		return (
			<div className="flex min-h-0 flex-1 flex-col">
				<DialogHeader className="mx-0 shrink-0 px-6 pr-12 text-left">
					<DialogTitle className="leading-snug text-balance">{labels.successTitle}</DialogTitle>
				</DialogHeader>
				<p className="text-foreground px-6 text-sm">{labels.success}</p>
			</div>
		);
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (currentStep !== 'about') {
			void onContinue();

			return;
		}

		submitAbout();
	};

	const submitAbout = () => {
		if (!imageSelection) {
			setImageError(resolveError('image-required'));
			setCurrentStep('details');

			return;
		}

		void form.handleSubmit(onSubmit)();
	};

	const stepTitle =
		currentStep === 'program'
			? labels.programStepTitle
			: currentStep === 'details'
				? labels.detailsStepTitle
				: labels.aboutStepTitle;

	return (
		<Form {...form}>
			<form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleSubmit}>
				<div className="-mt-6 flex h-[52px] shrink-0 items-center border-b pr-12 pl-6 sm:hidden">
					<CampaignSubmissionStepIndicator
						currentStep={currentStep}
						formStepsLabel={labels.formSteps}
						stepLabel={labels.stepLabel}
						programLabel={labels.program}
						detailsLabel={labels.details}
						aboutLabel={labels.about}
						variant="bars"
						className="min-w-0 flex-1"
					/>
				</div>
				<DialogHeader className="mx-0 shrink-0 px-6 pr-12 text-left max-sm:border-b-0 max-sm:pt-4 max-sm:pb-0">
					<DialogTitle ref={stepTitleRef} tabIndex={-1} className="leading-snug text-balance outline-none">
						{stepTitle}
					</DialogTitle>
				</DialogHeader>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4 pb-4">
					<CampaignSubmissionSteps
						currentStep={currentStep}
						form={form}
						labels={labels}
						programs={programs}
						programsLoading={programsLoading}
						programsError={programsError}
						primaryImageInputRef={primaryImageInputRef}
						imageSelection={imageSelection}
						defaultImages={defaultImages}
						defaultImagesLoading={defaultImagesLoading}
						defaultImagesError={defaultImagesError}
						uploadPreviewUrl={uploadPreviewUrl}
						onSelectDefaultImage={onSelectDefaultImage}
						onImageChange={onImageChange}
						imageError={imageError}
						submitError={submitError}
						isSubmitting={isSubmitting}
						profilePictureInputRef={profilePicture.inputRef}
						profilePicture={{
							previewUrl: profilePicture.previewUrl,
							error: profilePicture.error,
							onChange: profilePicture.setFromFile,
						}}
						sectionImageInputRef={sectionImage.inputRef}
						sectionImage={{
							previewUrl: sectionImage.previewUrl,
							error: sectionImage.error,
							onChange: sectionImage.setFromFile,
						}}
					/>
				</div>
				<div className="shrink-0">
					<CampaignSubmissionFooter
						currentStep={currentStep}
						labels={labels}
						isContinueDisabled={isContinueDisabled}
						isSubmitDisabled={isSubmitDisabled}
						isSubmitting={isSubmitting}
						onContinue={() => {
							void onContinue();
						}}
						onBack={onBack}
						onSubmit={submitAbout}
					/>
				</div>
			</form>
		</Form>
	);
};

export type { SubmissionLabels };
