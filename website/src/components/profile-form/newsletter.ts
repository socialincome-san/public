import { toNewsletterLanguage } from '@/components/newsletter/newsletter-language';
import { ContributorSession } from '@/modules/contributors/contributor.types';
import { subscribeToNewsletterAction, unsubscribeFromNewsletterAction } from '@/modules/newsletter/newsletter.actions';
import { ProfileFormOutput } from './schemas';

export const toggleNewsletter = async (values: ProfileFormOutput, session: ContributorSession, isSubscribed: boolean) => {
	if (values.type !== 'contributor') {
		return { success: true };
	}

	const newsletter = values.newsletter ?? false;
	const email = values.email;

	if (!email) {
		return { success: true };
	}
	if (newsletter === isSubscribed) {
		return { success: true };
	}

	const language = toNewsletterLanguage(values.language);

	if (newsletter) {
		return subscribeToNewsletterAction({
			email,
			firstname: values.firstName,
			lastname: values.lastName,
			language,
			country: session.country ?? undefined,
			isContributor: true,
		});
	}

	return unsubscribeFromNewsletterAction();
};
