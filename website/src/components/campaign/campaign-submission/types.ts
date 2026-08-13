import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { CampaignDefaultImageOption } from '@/lib/server-actions/campaign-public-actions';
import {
	type CampaignSubmissionErrorCode,
	type CampaignSubmissionFormValues,
} from '@/lib/services/campaign/campaign-submission-input';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import type { RefObject } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export type SubmissionLabels = {
	programStepTitle: string;
	detailsStepTitle: string;
	aboutStepTitle: string;
	aboutStepSubtitle: string;
	aboutStepDescription: string;
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
	campaignBackground: string;
	uploadImage: string;
	removeUploadedImage: string;
	profilePicture: string;
	profilePictureHint: string;
	editProfilePicture: string;
	creatorNamePlaceholder: string;
	quote: string;
	quotePlaceholder: string;
	quoteHint: string;
	hasAdditionalInformation: string;
	sectionDescription: string;
	sectionImage: string;
	instagramHandle: string;
	xHandle: string;
	linkWebsite: string;
	tiktokHandle: string;
	instagramHandlePlaceholder: string;
	xHandlePlaceholder: string;
	tiktokHandlePlaceholder: string;
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
	about: string;
	programsLoading: string;
	programsEmpty: string;
	defaultImagesLoading: string;
	defaultImagesError: string;
	errors: Record<CampaignSubmissionErrorCode, string>;
};

export type CampaignSubmissionStepId = 'program' | 'details' | 'about';

export type { CampaignSubmissionFormValues };

export type CampaignImageSelection = { type: 'default'; id: number } | { type: 'upload'; file: File } | null;

export type CampaignSubmissionImageUploadField = {
	inputRef: RefObject<HTMLInputElement | null>;
	previewUrl: string | null;
	error: string | null;
	onChange: (file: File | null) => void;
	setError: (error: string | null) => void;
	clear: () => void;
};

export type ProgramStepProps = {
	form: UseFormReturn<CampaignSubmissionFormValues>;
	labels: SubmissionLabels;
	programs: PublicSubmissionProgramOption[];
	programsLoading: boolean;
	programsError: string | null;
};

export type DetailsStepProps = {
	form: UseFormReturn<CampaignSubmissionFormValues>;
	labels: SubmissionLabels;
	primaryImage: CampaignSubmissionImageUploadField;
	imageSelection: CampaignImageSelection;
	defaultImages: CampaignDefaultImageOption[];
	defaultImagesLoading: boolean;
	defaultImagesError: string | null;
	onSelectDefaultImage: (id: number) => void;
};

export type AboutStepProps = {
	form: UseFormReturn<CampaignSubmissionFormValues>;
	labels: SubmissionLabels;
	profilePicture: CampaignSubmissionImageUploadField;
	sectionImage: CampaignSubmissionImageUploadField;
	submitError: string | null;
	isSubmitting: boolean;
	lang: WebsiteLanguage;
	turnstileSiteKey: string | undefined;
	onTurnstileTokenChange: (token: string | null) => void;
};
