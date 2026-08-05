import {
	type CampaignSubmissionErrorCode,
	type createCampaignSubmissionFormSchema,
} from '@/lib/services/campaign/campaign-submission-input';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import type { RefObject } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

export type SubmissionLabels = {
	title: string;
	description: string;
	goal: string;
	currency: string;
	endDate: string;
	program: string;
	primaryImage: string;
	submit: string;
	submitting: string;
	success: string;
	error: string;
	programPlaceholder: string;
	currencyPlaceholder: string;
	imageHint: string;
	continue: string;
	back: string;
	allCountries: string;
	recipientsCount: string;
	details: string;
	errors: Record<CampaignSubmissionErrorCode, string>;
};

export type CampaignSubmissionStepId = 'program' | 'details';

export type CampaignSubmissionFormValues = z.infer<ReturnType<typeof createCampaignSubmissionFormSchema>>;

export type CampaignSubmissionStepProps = {
	form: UseFormReturn<CampaignSubmissionFormValues>;
	labels: SubmissionLabels;
	programs: PublicSubmissionProgramOption[];
	programsError: string | null;
	primaryImageInputRef: RefObject<HTMLInputElement | null>;
	onImageChange: (file: File | null) => void;
	imageError: string | null;
	showImageRequired: boolean;
	showDetailsErrors: boolean;
	submitError: string | null;
};
