import { ContributorReferralSource } from '@/generated/prisma/enums';

type WizardReferralOption = {
	value: ContributorReferralSource;
	labelKey: 'familyfriends' | 'socialmedia' | 'events' | 'media' | 'other';
};

export const WIZARD_REFERRAL_OPTIONS: readonly WizardReferralOption[] = [
	{ value: ContributorReferralSource.family_and_friends, labelKey: 'familyfriends' },
	{ value: ContributorReferralSource.social_media, labelKey: 'socialmedia' },
	{ value: ContributorReferralSource.presentation, labelKey: 'events' },
	{ value: ContributorReferralSource.media, labelKey: 'media' },
	{ value: ContributorReferralSource.other, labelKey: 'other' },
] as const;
