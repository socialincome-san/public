import { LocaleCurrencySwitcher } from '@/components/app-shells/website/navbar/locale-currency-switcher';
import { CountryFlag } from '@/components/country-flag';
import { getChosenCountry, getVisitorCountry } from '@/lib/geo/visitor-geo';
import { type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { LocaleCurrencySwitcherGlobe } from '@socialincome/design-system/navigation/locale-currency-switcher/locale-currency-switcher';
import { cookies, headers } from 'next/headers';
import { Suspense } from 'react';

type Props = {
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	variant?: 'ghost' | 'outline';
};

const globe = <LocaleCurrencySwitcherGlobe />;

const SwitcherForVisitor = async (props: Props) => {
	const request = { headers: await headers(), cookies: await cookies() };
	const country = getVisitorCountry(request);

	return (
		<LocaleCurrencySwitcher
			{...props}
			chosenCountry={getChosenCountry(request.cookies)}
			visitorCountry={country}
			icon={country ? <CountryFlag country={country} size="sm" decorative fallback={globe} /> : globe}
		/>
	);
};

// Reading the request is dynamic, so the static shell renders the switcher with the globe and the flag streams in.
export const VisitorLocaleCurrencySwitcher = (props: Props) => (
	<Suspense fallback={<LocaleCurrencySwitcher {...props} chosenCountry={null} visitorCountry={null} icon={globe} />}>
		<SwitcherForVisitor {...props} />
	</Suspense>
);
