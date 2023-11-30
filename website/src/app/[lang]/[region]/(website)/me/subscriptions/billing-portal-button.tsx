'use client';

import { CreditCardIcon } from '@heroicons/react/24/outline';
import { Button } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useUser } from 'reactfire';
import Stripe from 'stripe';

type BillingPortalButtonProps = {
	translations: {
		manageSubscriptions: string;
	};
};

export function BillingPortalButton({ translations }: BillingPortalButtonProps) {
	const router = useRouter();
	const { data: authUser } = useUser();

	const { data: billingPortalUrl } = useQuery({
		queryKey: ['BillingPortalButton', authUser?.uid],
		queryFn: async () => {
			const firebaseAuthToken = await authUser?.getIdToken(true);
			const response = await fetch('/api/stripe/billing-portal-session/create', {
				method: 'POST',
				body: JSON.stringify({ firebaseAuthToken, returnUrl: window.location.href }),
			});
			const { url } = (await response.json()) as Stripe.Response<Stripe.BillingPortal.Session>;
			return url;
		},
	});

	return (
		<Button
			variant="ghost"
			size="lg"
			Icon={CreditCardIcon}
			onClick={() => router.push(billingPortalUrl!)}
			disabled={!billingPortalUrl}
		>
			{translations.manageSubscriptions}
		</Button>
	);
}
