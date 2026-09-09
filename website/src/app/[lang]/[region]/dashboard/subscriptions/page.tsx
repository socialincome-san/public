import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { APPLY_PAYMENT_METHOD_QUERY_PARAM } from '@/lib/services/stripe/stripe.types';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { type DefaultPageProps } from '../..';
import { SubscriptionsView } from './subscriptions-view';

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;
	const query = await searchParams;
	const applyPaymentMethodSubscriptionId = query[APPLY_PAYMENT_METHOD_QUERY_PARAM];

	if (applyPaymentMethodSubscriptionId) {
		const contributor = await getAuthenticatedContributorOrRedirect();
		const result = await services.stripe.applyCustomerDefaultPaymentMethodToOwnedSubscription({
			contributorId: contributor.id,
			stripeCustomerId: contributor.stripeCustomerId,
			subscriptionId: applyPaymentMethodSubscriptionId,
		});
		if (!result.success) {
			console.warn('Could not apply Stripe default payment method after portal return', {
				subscriptionId: applyPaymentMethodSubscriptionId,
				error: result.error,
			});
		}

		redirect(`/${lang}/${region}/dashboard/subscriptions`);
	}

	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<SubscriptionsView lang={lang as WebsiteLanguage} region={region as WebsiteRegion} />
		</Suspense>
	);
}
