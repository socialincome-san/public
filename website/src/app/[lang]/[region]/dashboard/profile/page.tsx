import { Card } from '@/components/card';
import { TranslatedProfileForm } from '@/components/profile-form/translated-form';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getActiveSubscriptionAction } from '@/lib/server-actions/newsletter-actions';
import { DefaultPageProps } from '../..';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	const newsletterSubscription = await getActiveSubscriptionAction();
	const newsletterSubscribed =
		newsletterSubscription.success &&
		newsletterSubscription.data !== null &&
		newsletterSubscription.data.status === 'subscribed';

	return (
		<Card>
			<TranslatedProfileForm
				session={contributor}
				isNewsletterSubscribed={newsletterSubscribed}
				language={lang as WebsiteLanguage}
			/>
		</Card>
	);
}
