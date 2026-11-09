import { blockMargins } from '@/components/content-blocks/block-margins';
import { CountryOfficeSection } from '@/components/storyblok/shared/country-office-section';
import type { CountryOffice } from '@/generated/storyblok/types/109655/country-office-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: CountryOffice;
	lang: WebsiteLanguage;
};

export const CountryOfficeBlock = ({ blok, lang }: Props) => (
	<CountryOfficeSection
		isoCode={String(blok.countryOffice ?? '')}
		title={blok.title}
		heading={blok.heading}
		description={blok.description}
		lang={lang}
		wrapperProps={{ ...storyblokEditable(blok), ...blockMargins(blok) }}
	/>
);
