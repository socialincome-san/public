import { CountryFlag } from '@/components/country-flag';
import { getVisitorCountry } from '@/lib/geo/visitor-geo';
import { LocaleCurrencySwitcherGlobe } from '@socialincome/design-system/navigation/locale-currency-switcher/locale-currency-switcher';
import { headers } from 'next/headers';
import { Suspense } from 'react';

const globe = <LocaleCurrencySwitcherGlobe />;

const VisitorCountryFlagFromHeaders = async () => {
	const country = getVisitorCountry(await headers());

	return country ? <CountryFlag country={country} size="sm" decorative fallback={globe} /> : globe;
};

// Reading the request headers is dynamic, so the static shell renders the globe and the flag streams in.
export const VisitorCountryFlag = () => (
	<Suspense fallback={globe}>
		<VisitorCountryFlagFromHeaders />
	</Suspense>
);
