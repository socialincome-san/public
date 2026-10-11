import { TranslatedProfileForm } from '@/components/profile-form/translated-form';
import { getActiveNewsletterSubscription } from '@/modules/newsletter/newsletter.service';
import { requireSession } from '@/server/session';

export default async function Page() {
	const contributor = await requireSession('contributor');

	const newsletterSubscription = await getActiveNewsletterSubscription(contributor.email);
	const newsletterSubscribed =
		newsletterSubscription.success &&
		newsletterSubscription.data !== null &&
		newsletterSubscription.data.status === 'subscribed';

	return <TranslatedProfileForm session={contributor} isNewsletterSubscribed={newsletterSubscribed} />;
}
