'use client';

import { Form } from '@/components/form';
import { getEligiblePublicSubmissionProgramsAction } from '@/lib/server-actions/campaign-public-actions';
import {
	campaignSubmissionDefaultCurrency,
	createCampaignSubmissionFormSchema,
	isCampaignSubmissionErrorCode,
	validateCampaignSubmissionImageMeta,
} from '@/lib/services/campaign/campaign-submission-input';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { CampaignSubmissionFooter } from './campaign-submission-footer';
import { CampaignSubmissionSteps } from './campaign-submission-steps';
import type { CampaignSubmissionFormValues, CampaignSubmissionStepId, SubmissionLabels } from './types';

type Props = {
	labels: SubmissionLabels;
	onSuccess?: () => void;
};

export const CampaignSubmissionForm = ({ labels, onSuccess }: Props) => {
	const [currentStep, setCurrentStep] = useState<CampaignSubmissionStepId>('program');
	const [programs, setPrograms] = useState<PublicSubmissionProgramOption[]>([]);
	const [programsError, setProgramsError] = useState<string | null>(null);
	const [primaryImage, setPrimaryImage] = useState<File | null>(null);
	const [imageError, setImageError] = useState<string | null>(null);
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

	const selectedProgramId = useWatch({ control: form.control, name: 'programId' });
	const canContinue = Boolean(selectedProgramId?.trim());

	useEffect(() => {
		let cancelled = false;

		const loadPrograms = async () => {
			const result = await getEligiblePublicSubmissionProgramsAction();
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
	}, [labels.error]);

	const onImageChange = (file: File | null) => {
		setPrimaryImage(file);
		setImageError(null);

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
			return;
		}

		form.clearErrors();
		setImageError(null);
		setSubmitError(null);
		setCurrentStep('details');
	};

	const onBack = () => {
		form.clearErrors();
		setImageError(null);
		setSubmitError(null);
		setCurrentStep('program');
	};

	const onSubmit = async (values: CampaignSubmissionFormValues) => {
		setSubmitError(null);
		setImageError(null);
		setSubmitSuccess(false);

		if (!primaryImage) {
			return;
		}

		const metaError = validateCampaignSubmissionImageMeta(primaryImage.size, primaryImage.type);
		if (metaError) {
			setImageError(resolveError(metaError));

			return;
		}

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

				if (isImageError) {
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
		if (currentStep !== 'details') {
			event.preventDefault();

			return;
		}

		void form.handleSubmit(onSubmit)(event);
	};

	return (
		<Form {...form}>
			<form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleSubmit}>
				<div className="flex-1 overflow-y-auto pb-4">
					<CampaignSubmissionSteps
						currentStep={currentStep}
						form={form}
						labels={labels}
						programs={programs}
						programsError={programsError}
						primaryImageInputRef={primaryImageInputRef}
						onImageChange={onImageChange}
						imageError={imageError}
						submitError={submitError}
					/>
				</div>
				<CampaignSubmissionFooter
					currentStep={currentStep}
					labels={labels}
					programsError={programsError}
					canContinue={canContinue}
					isSubmitting={isSubmitting}
					onContinue={onContinue}
					onBack={onBack}
				/>
			</form>
		</Form>
	);
};

export type { SubmissionLabels };
