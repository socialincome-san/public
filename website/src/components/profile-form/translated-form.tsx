import { CountryCode } from '@/generated/prisma/enums';
import { COUNTRY_CODES } from '@/lib/types/country';
import { ContributorSession } from '@/modules/contributors/contributor.types';
import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import type { UserSession } from '@/modules/users/user.types';
import { getTranslations } from 'next-intl/server';
import { ProfileForm } from './form';

export type ProfileFormTranslations = {
	personalInfoTitle: string;
	addressTitle: string;
	firstName: string;
	lastName: string;
	email: string;
	country: string;
	gender: string;
	howDidYouHear: string;
	selectGenderPlaceholder: string;
	selectOptionPlaceholder: string;
	genderMale: string;
	genderFemale: string;
	genderOther: string;
	genderPrivate: string;
	referralFamily: string;
	referralWork: string;
	referralSocial: string;
	referralMedia: string;
	referralPresentation: string;
	referralOther: string;
	street: string;
	number: string;
	city: string;
	zip: string;
	saveButton: string;
	updateError: string;
	userUpdatedToast: string;
	countries: Record<CountryCode, string>;
	newsletterLabel: string;
	language: string;
	name: string;
	focuses: string;
};

type Props = {
	session: ContributorSession | LocalPartnerSession | UserSession;
	isNewsletterSubscribed?: boolean;
};

export const TranslatedProfileForm = async ({ session, isNewsletterSubscribed }: Props) => {
	const [t, tCountries] = await Promise.all([getTranslations('website-me'), getTranslations('countries')]);

	const translatedCountries: Record<CountryCode, string> = Object.fromEntries(
		COUNTRY_CODES.map((code) => [code, tCountries(code)]),
	) as Record<CountryCode, string>;

	const translations: ProfileFormTranslations = {
		personalInfoTitle: t('profile.form.personal-info-title'),
		addressTitle: t('profile.form.address-title'),
		firstName: t('profile.form.firstname'),
		lastName: t('profile.form.lastname'),
		email: t('profile.form.email'),
		country: t('profile.form.country'),
		gender: t('profile.form.gender'),
		howDidYouHear: t('profile.form.how-did-you-hear'),
		selectGenderPlaceholder: t('profile.form.select-gender-placeholder'),
		selectOptionPlaceholder: t('profile.form.select-option-placeholder'),
		genderMale: t('profile.form.genders.male'),
		genderFemale: t('profile.form.genders.female'),
		genderOther: t('profile.form.genders.other'),
		genderPrivate: t('profile.form.genders.private'),
		referralFamily: t('profile.form.referrals.familyfriends'),
		referralWork: t('profile.form.referrals.work'),
		referralSocial: t('profile.form.referrals.socialmedia'),
		referralMedia: t('profile.form.referrals.media'),
		referralPresentation: t('profile.form.referrals.presentation'),
		referralOther: t('profile.form.referrals.other'),
		street: t('profile.form.street'),
		number: t('profile.form.street-number'),
		city: t('profile.form.city'),
		zip: t('profile.form.zip'),
		saveButton: t('profile.form.save-button'),
		updateError: t('profile.form.update-error'),
		userUpdatedToast: t('profile.form.user-updated-toast'),
		countries: translatedCountries,
		newsletterLabel: t('personal-info.newsletter-switch'),
		language: t('profile.form.language'),
		name: t('profile.form.name'),
		focuses: t('profile.form.focuses'),
	};

	return <ProfileForm session={session} translations={translations} isNewsletterSubscribed={isNewsletterSubscribed} />;
};
