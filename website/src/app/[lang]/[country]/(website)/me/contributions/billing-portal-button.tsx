'use client';

import { Button } from '@socialincome/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from 'reactfire';
import Stripe from 'stripe';

// TODO: i18n
export function BillingPortalButton() {
	const router = useRouter();
	const { data: authUser } = useUser();
	const [billingPortalUrl, setBillingPortalUrl] = useState<string | null>(null);

	useEffect(() => {
		authUser?.getIdToken(true).then(async (accessToken) => {
			const response = await fetch(
				`/api/stripe/billing-portal?accessToken=${accessToken}&returnUrl=${window.location.href}`,
			);
			const { url } = (await response.json()) as Stripe.Response<Stripe.BillingPortal.Session>;
			setBillingPortalUrl(url);
		});
	}, [authUser]);

	return (
		<Button onClick={() => router.push(billingPortalUrl!)} disabled={!billingPortalUrl}>
			Update Payment Settings
		</Button>
	);
}
