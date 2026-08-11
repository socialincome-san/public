import type { CampaignDefaultImageOption } from '@/lib/server-actions/campaign-public-actions';
import {
	type CampaignSubmissionErrorCode,
	type createCampaignSubmissionFormSchema,
} from '@/lib/services/campaign/campaign-submission-input';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import type { RefObject } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

export type SubmissionLabels = {
	programStepTitle: string;
	detailsStepTitle: string;
	title: string;
	description: string;
	goal: string;
	setGoalAmount: string;
	currency: string;
	endDate: string;
	duration: string;
	duration30: string;
	duration90: string;
	duration365: string;
	durationOther: string;
	access: string;
	accessPublic: string;
	accessPublicDescription: string;
	accessPrivate: string;
	accessPrivateDescription: string;
	accessRecommended: string;
	program: string;
	primaryImage: string;
	campaignBackground: string;
	uploadImage: string;
	removeUploadedImage: string;
	submit: string;
	submitting: string;
	successTitle: string;
	success: string;
	error: string;
	currencyPlaceholder: string;
	imageHint: string;
	continue: string;
	back: string;
	allCountries: string;
	filterByCountry: string;
	formSteps: string;
	stepLabel: string;
	recipientsCount: string;
	details: string;
	programsLoading: string;
	programsEmpty: string;
	defaultImagesLoading: string;
	defaultImagesError: string;
	errors: Record<CampaignSubmissionErrorCode, string>;
};

export type CampaignSubmissionStepId = 'program' | 'details';

export type CampaignSubmissionFormValues = z.infer<ReturnType<typeof createCampaignSubmissionFormSchema>>;

export type CampaignImageSelection = { type: 'default'; id: number } | { type: 'upload'; file: File } | null;

export type CampaignSubmissionStepProps = {
	form: UseFormReturn<CampaignSubmissionFormValues>;
	labels: SubmissionLabels;
	programs: PublicSubmissionProgramOption[];
	programsLoading: boolean;
	programsError: string | null;
	primaryImageInputRef: RefObject<HTMLInputElement | null>;
	imageSelection: CampaignImageSelection;
	defaultImages: CampaignDefaultImageOption[];
	defaultImagesLoading: boolean;
	defaultImagesError: string | null;
	uploadPreviewUrl: string | null;
	onSelectDefaultImage: (id: number) => void;
	onImageChange: (file: File | null) => void;
	imageError: string | null;
	submitError: string | null;
};
