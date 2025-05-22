import { WebsiteRegion } from '@socialincome/portal/src/i18n';
import { CountryCode } from '@socialincome/shared/src/types/country';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * We use the files from GitHub instead of the package so that donations from new countries are automatically supported.
 */
export const getFlagImageURL = (country: CountryCode | Exclude<WebsiteRegion, 'int'>) =>
	`https://raw.githubusercontent.com/lipis/flag-icons/a87d8b256743c9b0df05f20de2c76a7975119045/flags/1x1/${country.toLowerCase()}.svg`;
