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
	campaignSubmissionDefaultCurrency,
	createCampaignSubmissionFormSchema,
	endDateFromDurationPreset,
	isCampaignSubmissionErrorCode,
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

	const isContinueDisabled = programsLoading || programs.length === 0 || Boolean(programsError);

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

	const onContinue = () => {
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
	};

	const onBack = () => {
		form.clearErrors();
		setSubmitError(null);
		setCurrentStep('program');
	};

	const onSubmit = async (values: CampaignSubmissionFormValues) => {
		if (isSubmittingRef.current) {
			return;
		}

		setSubmitError(null);
		setSubmitSuccess(false);

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

		isSubmittingRef.current = true;
		setImageError(null);
		setIsSubmitting(true);

		try {
			const formData = new FormData();
			formData.append('title', values.title);
			formData.append('description', values.description);
			if (values.hasGoal && values.goal !== undefined && values.goal !== null && values.goal !== '') {
				formData.append('goal', String(values.goal));
			} else {
				formData.append('goal', '');
			}
			formData.append('currency', values.currency);
			formData.append('endDate', values.endDate);
			formData.append('programId', values.programId);
			formData.append('public', values.isPublic ? 'true' : 'false');

			if (imageSelection.type === 'upload') {
				formData.append('primaryImage', imageSelection.file);
			} else {
				formData.append('defaultImageId', String(imageSelection.id));
			}

			const response = await fetch('/api/campaign-submissions', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as { errorCode?: string } | null;
				const errorMessage = payload?.errorCode ? resolveError(payload.errorCode) : labels.error;
				const isImageError =
					payload?.errorCode === 'image-required' ||
					payload?.errorCode === 'image-too-large' ||
					payload?.errorCode === 'image-format-unsupported' ||
					payload?.errorCode === 'image-type-mismatch' ||
					payload?.errorCode === 'default-image-invalid';

				if (isImageError) {
					setImageError(errorMessage);
				} else {
					setSubmitError(errorMessage);
				}

				return;
			}

			setSubmitSuccess(true);
			form.reset(defaultFormValues());
			clearImageSelection();
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

		if (currentStep !== 'details') {
			return;
		}

		submitDetails();
	};

	const submitDetails = () => {
		if (!imageSelection) {
			setImageError(resolveError('image-required'));
			void form.trigger();

			return;
		}

		void form.handleSubmit(onSubmit)();
	};

	const stepTitle = currentStep === 'program' ? labels.programStepTitle : labels.detailsStepTitle;

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
					/>
				</div>
				<div className="shrink-0">
					<CampaignSubmissionFooter
						currentStep={currentStep}
						labels={labels}
						isContinueDisabled={isContinueDisabled}
						isSubmitting={isSubmitting}
						onContinue={onContinue}
						onBack={onBack}
						onSubmit={submitDetails}
					/>
				</div>
			</form>
		</Form>
	);
};

export type { SubmissionLabels };
