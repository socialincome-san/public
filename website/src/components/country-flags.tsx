import { WebsiteCurrency } from '@/lib/i18n/utils';
import { CH, EU } from 'country-flag-icons/react/1x1';
import { SL, US } from 'country-flag-icons/react/3x2';

export function getFlagComponentByCurrency(currency: WebsiteCurrency | undefined) {
	switch (currency) {
		case 'USD':
			return US;
		case 'CHF':
			return CH;
		case 'EUR':
			return EU;
		case 'SLE':
			return SL;
		default:
			return undefined;
	}
}
