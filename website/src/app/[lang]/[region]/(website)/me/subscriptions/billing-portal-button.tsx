'use client';

import { useApi } from '@/hooks/useApi';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { Button } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Stripe from 'stripe';

type BillingPortalButtonProps = {
	translations: {
		manageSubscriptions: string;
	};
};

export function BillingPortalButton({ translations }: BillingPortalButtonProps) {
	const router = useRouter();
	const api = useApi();

	const { data: billingPortalUrl } = useQuery({
		queryKey: ['me', 'subscriptions', 'billing-portal-button'],
		queryFn: async () => {
			const response = await api.post('/api/stripe/billing-portal-session/create', {
				returnUrl: window.location.href,
			});
			const { url } = (await response.json()) as Stripe.Response<Stripe.BillingPortal.Session>;
			return url || '';
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
