'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { createStripeCheckoutAction } from '@/lib/server-actions/stripe-actions';
import { Button } from '@socialincome/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type StripePaymentButtonProps = {
	amount: number;
	intervalCount: number;
	lang: string;
	region: string;
	buttonText: string;
};

export function StripePaymentButton({ amount, intervalCount, lang, region, buttonText }: StripePaymentButtonProps) {
	const router = useRouter();
	const { currency } = useI18n();
	const [submitting, setSubmitting] = useState(false);

	const handlePayment = async () => {
		try {
			setSubmitting(true);

			const url = await createStripeCheckoutAction({
				amount: amount * 100,
				intervalCount,
				currency,
				recurring: true,
				successUrl: `${window.location.origin}/${lang}/${region}/donate/success/stripe/{CHECKOUT_SESSION_ID}`,
			});

			router.push(url);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Button size="lg" type="button" className="w-full" showLoadingSpinner={submitting} onClick={handlePayment}>
			{buttonText}
		</Button>
	);
}
