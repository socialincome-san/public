import { getCountryIsoCode } from '@/components/storyblok/country/country.utils';
import { getSafeNumberFormatLocale, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { getPublicCountryStatsByIsoCodesAction } from '@/modules/countries/country.actions';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getCountriesAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { getTransparencySummaryAction } from '@/modules/transparency/transparency.actions';

// Figures shown in several places, e.g. the navigation and the timeline block, so they always match

export const getPaidOutFigure = async (lang: WebsiteLanguage, currency: WebsiteCurrency) => {
	const summary = await getTransparencySummaryAction();
	if (!summary.success || summary.data.financialSummary.outflowsChf <= 0) {
		return undefined;
	}
	const display = await resolveChfAmountsAction({
		amounts: [summary.data.financialSummary.outflowsChf],
		displayCurrency: currency,
	});
	const paidOut = display.success ? display.data[0] : undefined;
	const locale = getSafeNumberFormatLocale(lang);

	return (
		paidOut &&
		formatCurrencyLocale(paidOut.amount, paidOut.currency, locale, { compactThreshold: 1_000_000, compactLocale: locale })
	);
};

// One entry per country page; recipients is undefined while the stats are not available
export const getCountryRecipients = async (lang: WebsiteLanguage) => {
	const countries = await getCountriesAction(lang);
	const stories = (countries.success ? countries.data : []).map((story) => ({
		uuid: story.uuid,
		isoCode: getCountryIsoCode(story.content).toUpperCase(),
	}));
	const stats = await getPublicCountryStatsByIsoCodesAction(stories.map(({ isoCode }) => isoCode));

	return stories.map((country) => ({
		...country,
		recipients: stats.success ? (stats.data[country.isoCode]?.recipientsCount ?? 0) : undefined,
	}));
};
