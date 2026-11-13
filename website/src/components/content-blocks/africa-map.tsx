import { blockMargins } from '@/components/content-blocks/block-margins';
import { getCountryIsoCode, getCountrySlug, getCountryTitle } from '@/components/storyblok/country/country.utils';
import { WIDE_BREAKOUT_CLASSES } from '@/components/storyblok/journal/rich-text/image-with-caption';
import type { AfricaMap } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteBasePath, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { toCountryCode } from '@/lib/types/country';
import { getPublicCountryStatsByIsoCodesAction } from '@/modules/countries/country.actions';
import { getCountriesAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { cn } from '@socialincome/design-system/cn';
import { AfricaMap as AfricaMapView } from '@socialincome/design-system/data-display/africa-map/africa-map';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: AfricaMap;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	// On a page the block has margins of its own, in a journal article it sits in the text column
	placement?: 'page' | 'article';
};

export const AfricaMapBlock = async ({ blok, lang, currency, placement = 'page' }: Props) => {
	const codes = (blok.countries ?? []).flatMap((value) => toCountryCode(String(value)) ?? []);
	const [countryPagesResult, statsResult, t, tCountries] = await Promise.all([
		getCountriesAction(lang),
		getPublicCountryStatsByIsoCodesAction(codes),
		getTranslations('website-common'),
		getTranslations('countries'),
	]);
	const countryPages = countryPagesResult.success ? countryPagesResult.data : [];
	const statsByCode = statsResult.success ? statsResult.data : {};
	const countries = codes.map((code) => {
		const page = countryPages.find((country) => toCountryCode(getCountryIsoCode(country.content)) === code);
		const recipientsCount = statsByCode[code]?.recipientsCount ?? 0;

		return {
			code,
			name: page ? getCountryTitle(page.content) : tCountries(code),
			href: page ? `${getWebsiteBasePath(lang, currency)}/countries/${getCountrySlug(page)}` : undefined,
			// A country without recipients yet shows no number
			detail: recipientsCount > 0 ? t('africa-map.recipients', { count: recipientsCount }) : undefined,
		};
	});
	const map = (
		<AfricaMapView
			label={t('africa-map.label')}
			countries={countries}
			// Storyblok stores an unselected option as ''
			appearance={blok.mapColor === '' ? undefined : blok.mapColor}
			highlightColor={blok.highlightColor === '' ? undefined : blok.highlightColor}
			clouds={blok.clouds}
			shadedRegion={blok.shadedRegion === '' ? undefined : blok.shadedRegion}
			zoom={blok.zoom === '' ? undefined : blok.zoom}
		/>
	);

	if (placement === 'article') {
		// `not-prose` keeps the article's text styles off the lists, links and images of the map
		return (
			<div className={cn('not-prose my-8', blok.wide && WIDE_BREAKOUT_CLASSES)} {...storyblokEditable(blok)}>
				{map}
			</div>
		);
	}

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<div className={cn('mx-auto w-full', blok.wide ? 'max-w-[800px]' : 'max-w-2xl')}>{map}</div>
		</BlockWrapper>
	);
};
