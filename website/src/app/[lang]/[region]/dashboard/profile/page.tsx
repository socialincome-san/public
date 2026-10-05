import { TranslatedProfileForm } from '@/components/profile-form/translated-form';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getActiveNewsletterSubscription } from '@/modules/newsletter/newsletter.service';
import { DefaultPageProps } from '../..';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	const newsletterSubscription = await getActiveNewsletterSubscription(contributor.email);
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
