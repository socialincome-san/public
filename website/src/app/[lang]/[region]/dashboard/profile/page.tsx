import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { DefaultPageProps } from '../..';
import { ProfileForm } from './profile-form';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

	const translations = {
		personalInfoTitle: translator.t('profile.form.personal-info-title'),
		addressTitle: translator.t('profile.form.address-title'),
		firstName: translator.t('personal-info.firstname'),
		lastName: translator.t('personal-info.lastname'),
		email: translator.t('personal-info.email'),
		country: translator.t('personal-info.country'),
		gender: translator.t('personal-info.gender'),
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
		street: translator.t('personal-info.street'),
		number: translator.t('personal-info.street-number'),
		city: translator.t('personal-info.city'),
		zip: translator.t('personal-info.zip'),
		saveButton: translator.t('profile.form.save-button') || translator.t('personal-info.submit-button'),
		updateError: translator.t('profile.form.update-error'),
		userUpdatedToast: translator.t('personal-info.user-updated-toast'),
	};

	return <ProfileForm contributor={contributor} translations={translations} />;
}
