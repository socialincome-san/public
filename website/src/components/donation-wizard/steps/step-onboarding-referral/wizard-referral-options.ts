import { ContributorReferralSource } from '@/generated/prisma/enums';

export type WizardReferralOptionValue = ContributorReferralSource | 'prefer_not_to_say';

type WizardReferralOption = {
	value: WizardReferralOptionValue;
	labelKey: 'familyfriends' | 'socialmedia' | 'events' | 'media' | 'preferNotToSay' | 'other';
};

export const WIZARD_REFERRAL_OPTIONS: readonly WizardReferralOption[] = [
	{ value: ContributorReferralSource.family_and_friends, labelKey: 'familyfriends' },
	{ value: ContributorReferralSource.social_media, labelKey: 'socialmedia' },
	{ value: ContributorReferralSource.presentation, labelKey: 'events' },
	{ value: ContributorReferralSource.media, labelKey: 'media' },
	{ value: 'prefer_not_to_say', labelKey: 'preferNotToSay' },
	{ value: ContributorReferralSource.other, labelKey: 'other' },
] as const;

export const toContributorReferralSource = (value: WizardReferralOptionValue): ContributorReferralSource =>
	value === 'prefer_not_to_say' ? ContributorReferralSource.other : value;
