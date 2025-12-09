import { Card } from '@/components/card';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { DefaultPageProps } from '../..';
import { ProfileForm, ProfileFormTranslations } from './profile-form';

import { COUNTRY_CODES, CountryCode } from '@socialincome/shared/src/types/country';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
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
	};

	return (
		<Card>
			<ProfileForm contributor={contributor} translations={translations} />
		</Card>
	);
}
