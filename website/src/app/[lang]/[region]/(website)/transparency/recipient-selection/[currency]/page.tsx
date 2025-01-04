import { DefaultPageProps } from '@/app/[lang]/[region]';
import { WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { SelectionFaq } from './(sections)/faq';
import { HeroSection } from './(sections)/hero-section';
import { PastRounds } from './(sections)/past-rounds';
import { Resources } from './(sections)/resources';
import { SelectionProcess } from './(sections)/selection-process';

type RecipientSelectionPageProps = {
	params: {
		region: WebsiteRegion;
		lang: WebsiteLanguage;
		currency: string;
	};
} & DefaultPageProps;

export default async function Page({ params: { lang, region, currency } }: RecipientSelectionPageProps) {
	return (
		<div className="-mt-24 md:-mt-36">
			{/*<CurrencyRedirect currency={currency as WebsiteCurrency} />*/}
			<HeroSection lang={lang} region={region} />
			<Resources lang={lang} region={region} currency={currency} />
			<SelectionProcess lang={lang} region={region} />
			<PastRounds lang={lang} region={region} />
			<SelectionFaq lang={lang} region={region} />
		</div>
	);
}
