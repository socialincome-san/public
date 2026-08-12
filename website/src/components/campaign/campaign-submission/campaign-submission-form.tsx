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
	createCampaignSubmissionDetailsSchema,
	createCampaignSubmissionFormSchema,
	endDateFromDurationPreset,
	isCampaignSubmissionErrorCode,
	isCampaignSubmissionImageErrorCode,
	isCampaignSubmissionImageMultipartField,
	resolveCampaignSubmissionQuote,
} from '@/lib/services/campaign/campaign-submission-input';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { CampaignSubmissionFooter } from './campaign-submission-footer';
import { CampaignSubmissionStepIndicator } from './campaign-submission-step-indicator';
import { CampaignSubmissionSteps } from './campaign-submission-steps';
import type {
	CampaignImageSelection,
	CampaignSubmissionFormValues,
	CampaignSubmissionImageUploadField,
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
	const [selectedDefaultId, setSelectedDefaultId] = useState<number | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isSubmittingRef = useRef(false);
	const stepTitleRef = useRef<HTMLHeadingElement>(null);
	const hasMountedStep = useRef(false);
	const defaultImagesRef = useRef(defaultImages);

	const resolveError = useCallback(
		(code: string) => {
			if (isCampaignSubmissionErrorCode(code)) {
				return labels.errors[code];
			}

			return labels.error;
		},
		[labels.error, labels.errors],
	);

	const primaryImageUpload = useCampaignImageUpload({ resolveError });
	const profilePictureUpload = useCampaignImageUpload({ resolveError });
	const sectionImageUpload = useCampaignImageUpload({ resolveError });

	const formSchema = useMemo(() => createCampaignSubmissionFormSchema(resolveError), [resolveError]);
	const detailsSchema = useMemo(() => createCampaignSubmissionDetailsSchema(resolveError), [resolveError]);

	const form = useForm<CampaignSubmissionFormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: defaultFormValues(),
	});

	useEffect(() => {
		defaultImagesRef.current = defaultImages;
	}, [defaultImages]);

	const imageSelection: CampaignImageSelection = primaryImageUpload.file
		? { type: 'upload', file: primaryImageUpload.file }
		: selectedDefaultId !== null
			? { type: 'default', id: selectedDefaultId }
			: null;

	const onPrimaryImageChange = useCallback(
		(file: File | null) => {
			if (!file) {
				primaryImageUpload.clear();
				const firstDefault = defaultImagesRef.current[0];
				setSelectedDefaultId(firstDefault?.id ?? null);

				return;
			}

			primaryImageUpload.setFromFile(file);
			setSelectedDefaultId(null);
		},
		[primaryImageUpload.clear, primaryImageUpload.setFromFile],
	);

	const onSelectDefaultImage = useCallback(
		(id: number) => {
			primaryImageUpload.clear();
			setSelectedDefaultId(id);
		},
		[primaryImageUpload.clear],
	);

	const clearPrimaryImageSelection = useCallback(() => {
		primaryImageUpload.clear();
		setSelectedDefaultId(null);
	}, [primaryImageUpload.clear]);

	const primaryImage: CampaignSubmissionImageUploadField = {
		inputRef: primaryImageUpload.inputRef,
		previewUrl: primaryImageUpload.previewUrl,
		error: primaryImageUpload.error,
		onChange: onPrimaryImageChange,
		setError: primaryImageUpload.setError,
		clear: clearPrimaryImageSelection,
	};

	const profilePicture: CampaignSubmissionImageUploadField = {
		inputRef: profilePictureUpload.inputRef,
		previewUrl: profilePictureUpload.previewUrl,
		error: profilePictureUpload.error,
		onChange: profilePictureUpload.setFromFile,
		setError: profilePictureUpload.setError,
		clear: profilePictureUpload.clear,
	};

	const sectionImage: CampaignSubmissionImageUploadField = {
		inputRef: sectionImageUpload.inputRef,
		previewUrl: sectionImageUpload.previewUrl,
		error: sectionImageUpload.error,
		onChange: sectionImageUpload.setFromFile,
		setError: sectionImageUpload.setError,
		clear: sectionImageUpload.clear,
	};

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
					setSelectedDefaultId((current) => (primaryImageUpload.file ? current : null));

					return;
				}

				setDefaultImages(result.data);
				setDefaultImagesError(null);
				setSelectedDefaultId((current) => {
					if (current !== null) {
						return current;
					}

					const firstDefault = result.data[0];

					return firstDefault?.id ?? null;
				});
			} catch {
				if (cancelled) {
					return;
				}

				setDefaultImages([]);
				setDefaultImagesError(labels.defaultImagesError);
				setSelectedDefaultId((current) => (primaryImageUpload.file ? current : null));
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
	}, [currentStep, defaultImages.length, labels.defaultImagesError, primaryImageUpload.file]);

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
			primaryImage.setError(null);
			setSubmitError(null);
			setCurrentStep('details');

			return;
		}

		if (currentStep === 'details') {
			form.clearErrors([...campaignSubmissionDetailsFieldNames]);

			const detailsResult = detailsSchema.safeParse(form.getValues());
			if (!detailsResult.success) {
				const issuePaths = new Set<FieldPath<CampaignSubmissionFormValues>>();

				for (const issue of detailsResult.error.issues) {
					const path = issue.path[0];
					if (typeof path !== 'string') {
						continue;
					}

					const fieldName = path as FieldPath<CampaignSubmissionFormValues>;
					issuePaths.add(fieldName);
					form.setError(fieldName, {
						type: 'manual',
						message: issue.message,
					});
				}

				const firstInvalidField = [...issuePaths][0];
				if (firstInvalidField) {
					form.setFocus(firstInvalidField);
				}

				return;
			}

			if (defaultImagesLoading && imageSelection?.type !== 'upload') {
				return;
			}

			if (!imageSelection) {
				primaryImage.setError(resolveError('image-required'));

				return;
			}

			if (primaryImage.error) {
				return;
			}

			primaryImage.setError(null);
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
			primaryImage.setError(resolveError('image-required'));
			setCurrentStep('details');

			return;
		}

		if (primaryImage.error) {
			setCurrentStep('details');

			return;
		}

		if (profilePicture.error) {
			return;
		}

		if (values.hasAdditionalInformation && sectionImage.error) {
			return;
		}

		const submissionValues = {
			...values,
			quote: resolveCampaignSubmissionQuote(values.quote, labels.quotePlaceholder),
		};

		isSubmittingRef.current = true;
		primaryImage.setError(null);
		setIsSubmitting(true);

		try {
			const formData = appendCampaignSubmissionFormData(new FormData(), submissionValues, {
				primaryImage: imageSelection.type === 'upload' ? imageSelection.file : undefined,
				defaultImageId: imageSelection.type === 'default' ? imageSelection.id : undefined,
				profilePicture: profilePictureUpload.file ?? undefined,
				sectionImage: values.hasAdditionalInformation ? (sectionImageUpload.file ?? undefined) : undefined,
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
						primaryImage.setError(errorMessage);
						setCurrentStep('details');
					}
				} else {
					setSubmitError(errorMessage);
				}

				return;
			}

			setSubmitSuccess(true);
			form.reset(defaultFormValues());
			clearPrimaryImageSelection();
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
						programStep={{
							form,
							labels,
							programs,
							programsLoading,
							programsError,
						}}
						detailsStep={{
							form,
							labels,
							primaryImage,
							imageSelection,
							defaultImages,
							defaultImagesLoading,
							defaultImagesError,
							onSelectDefaultImage,
						}}
						aboutStep={{
							form,
							labels,
							profilePicture,
							sectionImage,
							submitError,
							isSubmitting,
						}}
					/>
				</div>
				<div className="shrink-0">
					<CampaignSubmissionFooter
						currentStep={currentStep}
						labels={labels}
						isContinueDisabled={isContinueDisabled}
						isSubmitting={isSubmitting}
						onContinue={() => {
							void onContinue();
						}}
						onBack={onBack}
						onSubmit={() => {
							void form.handleSubmit(onSubmit)();
						}}
					/>
				</div>
			</form>
		</Form>
	);
};

export type { SubmissionLabels };
