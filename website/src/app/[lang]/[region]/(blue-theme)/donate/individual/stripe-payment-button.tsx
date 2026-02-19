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

export const StripePaymentButton = ({ amount, intervalCount, lang, region, buttonText }: StripePaymentButtonProps) => {
	const router = useRouter();
	const { currency } = useI18n();
	const [submitting, setSubmitting] = useState(false);

	const handlePayment = async () => {
		setSubmitting(true);

		const result = await createStripeCheckoutAction({
			amount: amount * 100,
			intervalCount,
			currency,
			recurring: true,
			successUrl: `${window.location.origin}/${lang}/${region}/donate/success/stripe/{CHECKOUT_SESSION_ID}`,
		});

		setSubmitting(false);

		if (!result.success) {
			console.error(result.error);
			return;
		}

		router.push(result.data);
	};

	return (
		<Button size="lg" type="button" className="w-full" showLoadingSpinner={submitting} onClick={handlePayment}>
			{buttonText}
		</Button>
	);
};
