'use client';

import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { usePreferredWebsiteCurrency, useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { PendingContent } from '@socialincome/design-system/feedback/pending-content/pending-content';
import type { ReactNode } from 'react';

type Props = {
	variants: Record<WebsiteCurrency, ReactNode>;
};

// Until the visitor's currency is known, the region default keeps the space so the page does not jump.
export const CurrencySwitch = ({ variants }: Props) => {
	const preferredCurrency = usePreferredWebsiteCurrency();
	const currency = useWebsiteCurrency();

	return <PendingContent pending={preferredCurrency === undefined}>{variants[currency]}</PendingContent>;
};
