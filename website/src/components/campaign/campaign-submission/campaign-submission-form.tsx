'use client';

import { DialogHeader, DialogTitle } from '@/components/dialog';
import { Form } from '@/components/form';
import { useContributorSession } from '@/lib/firebase/hooks/useContributorSession';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import {
	getCampaignDefaultImagesAction,
	getEligiblePublicSubmissionProgramsAction,
	type CampaignDefaultImageOption,
} from '@/lib/server-actions/campaign-public-actions';
import {
	appendCampaignSubmissionFormData,
	campaignSubmissionAboutFieldNames,
	campaignSubmissionDefaultCurrency,
	campaignSubmissionDetailsFieldNames,
	campaignSubmissionPersonalFieldNames,
	createCampaignSubmissionDetailsSchema,
	createCampaignSubmissionFormSchema,
	createCampaignSubmissionPersonalSchema,
	endDateFromDurationPreset,
	isCampaignSubmissionErrorCode,
	isCampaignSubmissionImageErrorCode,
	isCampaignSubmissionImageMultipartField,
	resolveCampaignSubmissionQuote,
} from '@/lib/services/campaign/campaign-submission-input';
import { turnstileResponseFieldName } from '@/lib/services/campaign/turnstile-field';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { CampaignSubmissionFooter } from './campaign-submission-footer';
import { CampaignSubmissionStepIndicator } from './campaign-submission-step-indicator';
import { CampaignSubmissionSteps } from './campaign-submission-steps';
import { addPendingClaimId } from './pending-claim-ids';
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
	region: WebsiteRegion;
	onSuccess?: () => void;
};

const guestSteps = ['program', 'details', 'about', 'personal'] as const satisfies readonly CampaignSubmissionStepId[];
const contributorSteps = ['program', 'details', 'about'] as const satisfies readonly CampaignSubmissionStepId[];

const submittedCampaignSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const readSubmittedCampaignSlug = (payload: unknown): string | null => {
	if (typeof payload !== 'object' || payload === null || !('slug' in payload)) {
		return null;
	}

	const { slug } = payload;
	if (typeof slug !== 'string') {
		return null;
	}

	const trimmed = slug.trim();
	if (!submittedCampaignSlugPattern.test(trimmed)) {
		return null;
	}

	return trimmed;
};

const readSubmittedCampaignClaimId = (payload: unknown): string | null => {
	if (typeof payload !== 'object' || payload === null || !('claimId' in payload)) {
		return null;
	}

	const { claimId } = payload;
	if (typeof claimId !== 'string') {
		return null;
	}

	const trimmed = claimId.trim();
	if (!trimmed) {
		return null;
	}

	return trimmed;
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
	firstName: '',
	lastName: '',
	email: '',
});

export const CampaignSubmissionForm = ({ labels, lang, region, onSuccess }: Props) => {
	const router = useRouter();
	const { contributorSession, loading: contributorSessionLoading } = useContributorSession();
	const isLoggedInContributor = contributorSession?.type === 'contributor';
	const visibleSteps = isLoggedInContributor ? contributorSteps : guestSteps;
	const lastStep = visibleSteps[visibleSteps.length - 1];

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
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);
	const isSubmittingRef = useRef(false);
	const stepTitleRef = useRef<HTMLHeadingElement>(null);
	const hasMountedStep = useRef(false);
	const defaultImagesRef = useRef(defaultImages);
	const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
	const onTurnstileTokenChange = useCallback((token: string | null) => {
		setTurnstileToken(token);
	}, []);
	const resetTurnstileWidget = () => {
		setTurnstileToken(null);
		setTurnstileWidgetKey((key) => key + 1);
	};

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
	const {
		file: primaryImageFile,
		previewUrl: primaryImagePreviewUrl,
		error: primaryImageError,
		inputRef: primaryImageInputRef,
		setFromFile: setPrimaryImageFromFile,
		clear: clearPrimaryImageUpload,
		setError: setPrimaryImageError,
	} = primaryImageUpload;
	const {
		file: profilePictureFile,
		previewUrl: profilePicturePreviewUrl,
		error: profilePictureError,
		inputRef: profilePictureInputRef,
		setFromFile: setProfilePictureFromFile,
		clear: clearProfilePictureUpload,
		setError: setProfilePictureError,
	} = profilePictureUpload;
	const {
		file: sectionImageFile,
		previewUrl: sectionImagePreviewUrl,
		error: sectionImageError,
		inputRef: sectionImageInputRef,
		setFromFile: setSectionImageFromFile,
		clear: clearSectionImageUpload,
		setError: setSectionImageError,
	} = sectionImageUpload;

	const formSchema = useMemo(() => createCampaignSubmissionFormSchema(resolveError), [resolveError]);
	const detailsSchema = useMemo(() => createCampaignSubmissionDetailsSchema(resolveError), [resolveError]);
	const personalSchema = useMemo(() => createCampaignSubmissionPersonalSchema(resolveError), [resolveError]);

	const form = useForm<CampaignSubmissionFormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: defaultFormValues(),
	});

	useEffect(() => {
		defaultImagesRef.current = defaultImages;
	}, [defaultImages]);

	useEffect(() => {
		if (isLoggedInContributor && currentStep === 'personal') {
			setCurrentStep('about');
		}
	}, [currentStep, isLoggedInContributor]);

	const imageSelection: CampaignImageSelection = primaryImageFile
		? { type: 'upload', file: primaryImageFile }
		: selectedDefaultId !== null
			? { type: 'default', id: selectedDefaultId }
			: null;

	const onPrimaryImageChange = useCallback(
		(file: File | null) => {
			if (!file) {
				clearPrimaryImageUpload();
				const firstDefault = defaultImagesRef.current[0];
				setSelectedDefaultId(firstDefault?.id ?? null);

				return;
			}

			setPrimaryImageFromFile(file);
			setSelectedDefaultId(null);
		},
		[clearPrimaryImageUpload, setPrimaryImageFromFile],
	);

	const onSelectDefaultImage = useCallback(
		(id: number) => {
			clearPrimaryImageUpload();
			setSelectedDefaultId(id);
		},
		[clearPrimaryImageUpload],
	);

	const clearPrimaryImageSelection = useCallback(() => {
		clearPrimaryImageUpload();
		setSelectedDefaultId(null);
	}, [clearPrimaryImageUpload]);

	const primaryImage: CampaignSubmissionImageUploadField = {
		inputRef: primaryImageInputRef,
		previewUrl: primaryImagePreviewUrl,
		error: primaryImageError,
		onChange: onPrimaryImageChange,
		setError: setPrimaryImageError,
		clear: clearPrimaryImageSelection,
	};

	const profilePicture: CampaignSubmissionImageUploadField = {
		inputRef: profilePictureInputRef,
		previewUrl: profilePicturePreviewUrl,
		error: profilePictureError,
		onChange: setProfilePictureFromFile,
		setError: setProfilePictureError,
		clear: clearProfilePictureUpload,
	};

	const sectionImage: CampaignSubmissionImageUploadField = {
		inputRef: sectionImageInputRef,
		previewUrl: sectionImagePreviewUrl,
		error: sectionImageError,
		onChange: setSectionImageFromFile,
		setError: setSectionImageError,
		clear: clearSectionImageUpload,
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
					setSelectedDefaultId((current) => (primaryImageFile ? current : null));

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
				setSelectedDefaultId((current) => (primaryImageFile ? current : null));
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
	}, [currentStep, defaultImages.length, labels.defaultImagesError, primaryImageFile]);

	useEffect(() => {
		if (!hasMountedStep.current) {
			hasMountedStep.current = true;

			return;
		}

		stepTitleRef.current?.focus();
	}, [currentStep]);

	const applySchemaErrors = (issuePaths: Set<FieldPath<CampaignSubmissionFormValues>>, issues: { path: PropertyKey[]; message: string }[]) => {
		for (const issue of issues) {
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
	};

	const validateAboutStep = () => {
		form.clearErrors([...campaignSubmissionAboutFieldNames]);

		const aboutResult = formSchema.safeParse(form.getValues());
		if (!aboutResult.success) {
			const issuePaths = new Set<FieldPath<CampaignSubmissionFormValues>>();
			const aboutFieldSet = new Set<string>(campaignSubmissionAboutFieldNames);

			applySchemaErrors(
				issuePaths,
				aboutResult.error.issues.filter((issue) => {
					const path = issue.path[0];

					return typeof path === 'string' && aboutFieldSet.has(path);
				}),
			);

			if (issuePaths.size > 0) {
				return false;
			}
		}

		if (profilePicture.error) {
			return false;
		}

		if (form.getValues('hasAdditionalInformation') && sectionImage.error) {
			return false;
		}

		return true;
	};

	const isContinueDisabled =
		currentStep === 'program'
			? programsLoading || programs.length === 0 || Boolean(programsError)
			: currentStep === 'details'
				? defaultImagesLoading && imageSelection?.type !== 'upload'
				: currentStep === 'about'
					? contributorSessionLoading
					: false;

	const onContinue = () => {
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
				applySchemaErrors(issuePaths, detailsResult.error.issues);

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

			return;
		}

		if (currentStep === 'about') {
			if (contributorSessionLoading || isLoggedInContributor) {
				return;
			}

			if (!validateAboutStep()) {
				return;
			}

			setSubmitError(null);
			setCurrentStep('personal');
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

		if (currentStep === 'personal') {
			setCurrentStep('about');

			return;
		}

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

		if (!isLoggedInContributor) {
			form.clearErrors([...campaignSubmissionPersonalFieldNames]);

			const personalResult = personalSchema.safeParse({
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
			});
			if (!personalResult.success) {
				const issuePaths = new Set<FieldPath<CampaignSubmissionFormValues>>();
				applySchemaErrors(issuePaths, personalResult.error.issues);
				setCurrentStep('personal');

				return;
			}
		}

		if (turnstileSiteKey && !turnstileToken) {
			setSubmitError(resolveError('turnstile-required'));

			return;
		}

		const submissionValues = {
			...values,
			quote: resolveCampaignSubmissionQuote(values.quote, labels.quotePlaceholder),
			...(isLoggedInContributor
				? { firstName: '', lastName: '', email: '' }
				: {
						firstName: values.firstName.trim(),
						lastName: values.lastName.trim(),
						email: values.email.trim(),
					}),
		};

		isSubmittingRef.current = true;
		primaryImage.setError(null);
		profilePicture.setError(null);
		sectionImage.setError(null);
		setIsSubmitting(true);

		try {
			const formData = appendCampaignSubmissionFormData(new FormData(), submissionValues, {
				primaryImage: imageSelection.type === 'upload' ? imageSelection.file : undefined,
				defaultImageId: imageSelection.type === 'default' ? imageSelection.id : undefined,
				profilePicture: profilePictureFile ?? undefined,
				sectionImage: values.hasAdditionalInformation ? (sectionImageFile ?? undefined) : undefined,
				includePersonalData: !isLoggedInContributor,
			});
			if (turnstileToken) {
				formData.append(turnstileResponseFieldName, turnstileToken);
			}

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

				resetTurnstileWidget();

				return;
			}

			const payload: unknown = await response.json().catch(() => null);
			const campaignSlug = readSubmittedCampaignSlug(payload);
			const claimId = readSubmittedCampaignClaimId(payload);
			if (claimId) {
				addPendingClaimId(claimId);
			}
			setSubmitSuccess(true);
			form.reset(defaultFormValues());
			clearPrimaryImageSelection();
			profilePicture.clear();
			sectionImage.clear();
			resetTurnstileWidget();
			setDefaultImages([]);
			setCurrentStep('program');
			onSuccess?.();
			if (campaignSlug) {
				router.push(getWebsitePublicPath(lang, region, `campaigns/${campaignSlug}`));
			}
		} catch {
			resetTurnstileWidget();
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
				<p className="text-foreground px-6 pt-4 text-center text-sm">{labels.success}</p>
			</div>
		);
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (currentStep !== lastStep) {
			onContinue();

			return;
		}

		void form.handleSubmit(onSubmit)();
	};

	const stepTitle =
		currentStep === 'program'
			? labels.programStepTitle
			: currentStep === 'details'
				? labels.detailsStepTitle
				: currentStep === 'personal'
					? labels.personalStepTitle
					: labels.aboutStepTitle;

	const turnstileProps = {
		submitError,
		lang,
		turnstileSiteKey,
		turnstileWidgetKey,
		onTurnstileTokenChange,
	};

	return (
		<Form {...form}>
			<form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleSubmit}>
				<div className="-mt-6 flex h-[52px] shrink-0 items-center border-b pr-12 pl-6 sm:hidden">
					<CampaignSubmissionStepIndicator
						currentStep={currentStep}
						steps={visibleSteps}
						formStepsLabel={labels.formSteps}
						stepLabel={labels.stepLabel}
						programLabel={labels.program}
						detailsLabel={labels.details}
						aboutLabel={labels.about}
						personalLabel={labels.personal}
						variant="bars"
						className="min-w-0 flex-1"
					/>
				</div>
				<DialogHeader className="mx-0 shrink-0 px-6 pr-12 text-left max-sm:border-b-0 max-sm:pt-4 max-sm:pb-0">
					<DialogTitle ref={stepTitleRef} tabIndex={-1} className="leading-snug text-balance outline-none">
						{stepTitle}
					</DialogTitle>
				</DialogHeader>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
							isSubmitting,
							...(isLoggedInContributor ? turnstileProps : {}),
						}}
						personalStep={{
							form,
							labels,
							isSubmitting,
							...turnstileProps,
						}}
					/>
				</div>
				<div className="shrink-0">
					<CampaignSubmissionFooter
						currentStep={currentStep}
						visibleSteps={visibleSteps}
						labels={labels}
						isContinueDisabled={isContinueDisabled}
						isSubmitting={isSubmitting}
						onContinue={onContinue}
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
