'use client';

import { Form } from '@/components/form';
import { getEligiblePublicSubmissionProgramsAction } from '@/lib/server-actions/campaign-public-actions';
import {
	campaignSubmissionDefaultCurrency,
	createCampaignSubmissionFormSchema,
	isCampaignSubmissionErrorCode,
	validateCampaignSubmissionImageMeta,
} from '@/lib/services/campaign/campaign-submission-input';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { CampaignSubmissionFooter } from './campaign-submission-footer';
import { CampaignSubmissionSteps } from './campaign-submission-steps';
import type { CampaignSubmissionFormValues, CampaignSubmissionStepId, SubmissionLabels } from './types';

type Props = {
	labels: SubmissionLabels;
	lang: WebsiteLanguage;
	onSuccess?: () => void;
};

export const CampaignSubmissionForm = ({ labels, lang, onSuccess }: Props) => {
	const [currentStep, setCurrentStep] = useState<CampaignSubmissionStepId>('program');
	const [programs, setPrograms] = useState<PublicSubmissionProgramOption[]>([]);
	const [programsError, setProgramsError] = useState<string | null>(null);
	const [primaryImage, setPrimaryImage] = useState<File | null>(null);
	const [imageError, setImageError] = useState<string | null>(null);
	const [showImageRequired, setShowImageRequired] = useState(false);
	const [showDetailsErrors, setShowDetailsErrors] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const primaryImageInputRef = useRef<HTMLInputElement>(null);

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
		defaultValues: {
			title: '',
			description: '',
			goal: undefined,
			currency: campaignSubmissionDefaultCurrency,
			endDate: '',
			programId: '',
		},
	});

	useEffect(() => {
		let cancelled = false;

		const loadPrograms = async () => {
			const result = await getEligiblePublicSubmissionProgramsAction(lang);
			if (cancelled) {
				return;
			}

			if (!result.success) {
				setProgramsError(labels.error);

				return;
			}

			setPrograms(result.data);
			setProgramsError(null);
		};

		void loadPrograms();

		return () => {
			cancelled = true;
		};
	}, [labels.error, lang]);

	const onImageChange = (file: File | null) => {
		setPrimaryImage(file);
		setImageError(null);
		setShowImageRequired(false);

		if (!file) {
			return;
		}

		const metaError = validateCampaignSubmissionImageMeta(file.size, file.type);
		if (metaError) {
			setImageError(resolveError(metaError));
		}
	};

	const onContinue = () => {
		const programId = form.getValues('programId').trim();
		if (!programId) {
			form.setError('programId', {
				type: 'manual',
				message: resolveError('program-required'),
			});

			return;
		}

		form.clearErrors();
		setImageError(null);
		setShowImageRequired(false);
		setShowDetailsErrors(false);
		setSubmitError(null);
		setCurrentStep('details');
	};

	const onBack = () => {
		form.clearErrors();
		setImageError(null);
		setShowImageRequired(false);
		setShowDetailsErrors(false);
		setSubmitError(null);
		setCurrentStep('program');
	};

	const onSubmit = async (values: CampaignSubmissionFormValues) => {
		setSubmitError(null);
		setSubmitSuccess(false);

		if (!primaryImage) {
			setShowImageRequired(true);

			return;
		}

		const metaError = validateCampaignSubmissionImageMeta(primaryImage.size, primaryImage.type);
		if (metaError) {
			setImageError(resolveError(metaError));

			return;
		}

		setImageError(null);
		setShowImageRequired(false);
		setIsSubmitting(true);

		try {
			const formData = new FormData();
			formData.append('title', values.title);
			formData.append('description', values.description);
			formData.append('goal', String(values.goal));
			formData.append('currency', values.currency);
			formData.append('endDate', values.endDate);
			formData.append('programId', values.programId);
			formData.append('primaryImage', primaryImage);

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
					payload?.errorCode === 'image-type-mismatch';

				if (payload?.errorCode === 'image-required') {
					setShowImageRequired(true);
				} else if (isImageError) {
					setImageError(errorMessage);
				} else {
					setSubmitError(errorMessage);
				}

				return;
			}

			setSubmitSuccess(true);
			form.reset({
				title: '',
				description: '',
				goal: undefined,
				currency: campaignSubmissionDefaultCurrency,
				endDate: '',
				programId: '',
			});
			setPrimaryImage(null);
			if (primaryImageInputRef.current) {
				primaryImageInputRef.current.value = '';
			}
			setCurrentStep('program');
			onSuccess?.();
		} catch {
			setSubmitError(labels.error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (submitSuccess) {
		return <p className="text-foreground text-sm">{labels.success}</p>;
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (currentStep !== 'details') {
			return;
		}

		submitDetails();
	};

	const submitDetails = () => {
		setShowDetailsErrors(true);

		if (!primaryImage) {
			setShowImageRequired(true);
		}

		void form.handleSubmit(onSubmit)();
	};

	return (
		<Form {...form}>
			<form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleSubmit}>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-4">
					<CampaignSubmissionSteps
						currentStep={currentStep}
						form={form}
						labels={labels}
						programs={programs}
						programsError={programsError}
						primaryImageInputRef={primaryImageInputRef}
						onImageChange={onImageChange}
						imageError={imageError}
						showImageRequired={showImageRequired}
						showDetailsErrors={showDetailsErrors}
						submitError={submitError}
					/>
				</div>
				<div className="shrink-0">
					<CampaignSubmissionFooter
						currentStep={currentStep}
						labels={labels}
						programsError={programsError}
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
