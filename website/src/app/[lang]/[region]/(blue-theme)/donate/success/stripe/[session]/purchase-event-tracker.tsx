'use client';

import { useEffect } from 'react';

type PurchaseEventTrackerProps = {
	transactionId: string;
	value: number;
	currency: string;
	recurring: boolean;
};

declare global {
	interface Window {
		dataLayer: Record<string, unknown>[];
	}
}

export const PurchaseEventTracker = ({ transactionId, value, currency, recurring }: PurchaseEventTrackerProps) => {
	useEffect(() => {
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({
			event: 'purchase',
			ecommerce: {
				transaction_id: transactionId,
				value,
				currency,
				recurring,
				items: [{ item_name: 'Social Income', quantity: 1, price: value }],
			},
		});
	}, [transactionId, value, currency, recurring]);

	return null;
};
