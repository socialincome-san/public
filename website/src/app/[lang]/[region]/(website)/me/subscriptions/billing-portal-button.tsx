'use client';

import { Button } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useUser } from 'reactfire';
import Stripe from 'stripe';

// TODO: i18n
export function BillingPortalButton() {
	const router = useRouter();
	const { data: authUser } = useUser();

	const { data: billingPortalUrl } = useQuery({
		queryKey: ['BillingPortalButton', authUser?.uid],
		queryFn: async () => {
			const firebaseAuthToken = await authUser?.getIdToken(true);
			const response = await fetch(
				`/api/stripe/billing-portal-session?firebaseAuthToken=${firebaseAuthToken}&returnUrl=${window.location.href}`,
			);
			const { url } = (await response.json()) as Stripe.Response<Stripe.BillingPortal.Session>;
			return url;
		},
	});

	return (
		<Button variant="ghost" size="lg" onClick={() => router.push(billingPortalUrl!)} disabled={!billingPortalUrl}>
			Manage Subscriptions
		</Button>
	);
}
