import { TranslatedProfileForm } from '@/components/profile-form/translated-form';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { DefaultPageProps } from '../..';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	const newsletterSubscription = await services.sendgrid.getActiveSubscription(contributor);
	const newsletterSubscribed =
		newsletterSubscription.success &&
		newsletterSubscription.data !== null &&
		newsletterSubscription.data.status === 'subscribed';

	return (
		<TranslatedProfileForm
			session={contributor}
			isNewsletterSubscribed={newsletterSubscribed}
			language={lang as WebsiteLanguage}
		/>
	);
}
