import { CountryCode } from '@/generated/prisma/enums';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { UserSession } from '@/lib/services/user/user.types';
import { COUNTRY_CODES } from '@/lib/types/country';
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
	causes: string;
};

type Props = {
	session: ContributorSession | LocalPartnerSession | UserSession;
	language?: WebsiteLanguage;
	isNewsletterSubscribed?: boolean;
};

export async function TranslatedProfileForm({ session, language = 'en', isNewsletterSubscribed }: Props) {
	const translator = await Translator.getInstance({
		language,
		namespaces: ['website-me', 'countries'],
	});

	const translatedCountries: Record<CountryCode, string> = Object.fromEntries(
		COUNTRY_CODES.map((code) => [code, translator.t(code)]),
	) as Record<CountryCode, string>;

	const translations: ProfileFormTranslations = {
		personalInfoTitle: translator.t('profile.form.personal-info-title'),
		addressTitle: translator.t('profile.form.address-title'),
		firstName: translator.t('profile.form.firstname'),
		lastName: translator.t('profile.form.lastname'),
		email: translator.t('profile.form.email'),
		country: translator.t('profile.form.country'),
		gender: translator.t('profile.form.gender'),
		howDidYouHear: translator.t('profile.form.how-did-you-hear'),
		selectGenderPlaceholder: translator.t('profile.form.select-gender-placeholder'),
		selectOptionPlaceholder: translator.t('profile.form.select-option-placeholder'),
		genderMale: translator.t('profile.form.genders.male'),
		genderFemale: translator.t('profile.form.genders.female'),
		genderOther: translator.t('profile.form.genders.other'),
		genderPrivate: translator.t('profile.form.genders.private'),
		referralFamily: translator.t('profile.form.referrals.familyfriends'),
		referralWork: translator.t('profile.form.referrals.work'),
		referralSocial: translator.t('profile.form.referrals.socialmedia'),
		referralMedia: translator.t('profile.form.referrals.media'),
		referralPresentation: translator.t('profile.form.referrals.presentation'),
		referralOther: translator.t('profile.form.referrals.other'),
		street: translator.t('profile.form.street'),
		number: translator.t('profile.form.street-number'),
		city: translator.t('profile.form.city'),
		zip: translator.t('profile.form.zip'),
		saveButton: translator.t('profile.form.save-button'),
		updateError: translator.t('profile.form.update-error'),
		userUpdatedToast: translator.t('profile.form.user-updated-toast'),
		countries: translatedCountries,
		newsletterLabel: translator.t('personal-info.newsletter-switch'),
		language: translator.t('profile.form.language'),
		name: translator.t('profile.form.name'),
		causes: translator.t('profile.form.causes'),
	};

	return <ProfileForm session={session} translations={translations} isNewsletterSubscribed={isNewsletterSubscribed} />;
}
