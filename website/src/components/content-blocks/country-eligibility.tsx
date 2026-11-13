import { blockMargins } from '@/components/content-blocks/block-margins';
import { CountryEligibilityTable } from '@/components/country-eligibility/country-eligibility-table';
import { getCountryPageHrefs } from '@/components/country-eligibility/country-page-hrefs';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCountryEligibilityAction } from '@/modules/countries/country.actions';
import { Alert, AlertDescription } from '@socialincome/design-system/feedback/alert/alert';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

// Mirrors the `countryEligibility` component in Storyblok. Replace it with the generated type the next time
// the Storyblok types are regenerated.
export type CountryEligibilityBlok = {
	showSearch?: boolean;
	showFilters?: boolean;
	showExpandAll?: boolean;
	marginTop?: '' | 'none' | 'sm' | 'md' | 'lg' | 'xl';
	marginBottom?: '' | 'none' | 'sm' | 'md' | 'lg' | 'xl';
	component: 'countryEligibility';
	_uid: string;
	_editable?: string | undefined;
	[k: string]: unknown;
};

type Props = {
	blok: CountryEligibilityBlok;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CountryEligibilityBlock = async ({ blok, lang, currency }: Props) => {
	const [result, countryPageHrefs] = await Promise.all([getCountryEligibilityAction(), getCountryPageHrefs(lang, currency)]);

	if (!result.success) {
		const t = await getTranslations('create-program-wizard');

		return (
			<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
				<Alert role="status">
					<AlertDescription>{t('country_eligibility_page.unavailable')}</AlertDescription>
				</Alert>
			</BlockWrapper>
		);
	}

	// Storyblok omits booleans that were never saved, so only an explicit false hides an option
	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<CountryEligibilityTable
				rows={result.data}
				countryPageHrefs={countryPageHrefs}
				showSearch={blok.showSearch !== false}
				showFilters={blok.showFilters !== false}
				showExpandAll={blok.showExpandAll !== false}
			/>
		</BlockWrapper>
	);
};
