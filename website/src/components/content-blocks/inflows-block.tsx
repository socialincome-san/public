import { BlockWrapper } from '@/components/block-wrapper';
import { getDonationExplainerVideo } from '@/components/donation-wizard/utils/donation-explainer-video';
import { InflowsSection, type InflowsSectionSegment } from '@/components/inflows/inflows-section';
import { buildInflowSegments, parseChfAmount } from '@/components/inflows/inflows-segments';
import type { Inflows as InflowsBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { Translator } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: InflowsBlok;
	lang: WebsiteLanguage;
};

export const InflowsBlock = async ({ blok, lang }: Props) => {
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const [dataResult, rates, translator] = await Promise.all([
		services.transparency.getTransparencySummary(),
		services.currencyDisplay.fetchWalletPayoutDisplayRates(displayCurrency),
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
	]);

	if (!dataResult.success) {
		return null;
	}

	const individualsChf = dataResult.data.financialSummary.inflowsChf;
	const foundationsChf = parseChfAmount(blok.foundationInflows);
	const corporateChf = parseChfAmount(blok.corporatePartnerInflows);

	const individuals = services.currencyDisplay.resolveFromChf(individualsChf, displayCurrency, rates);
	const foundations = services.currencyDisplay.resolveFromChf(foundationsChf, displayCurrency, rates);
	const corporate = services.currencyDisplay.resolveFromChf(corporateChf, displayCurrency, rates);

	const { segments: computedSegments, total } = buildInflowSegments({
		individuals: individuals.amount,
		foundations: foundations.amount,
		corporate: corporate.amount,
	});

	const locale = getSafeNumberFormatLocale(lang);
	const currency = individuals.currency;
	const formatAmount = (amount: number) => formatCurrencyLocale(amount, currency, locale, { maximumFractionDigits: 0 });

	const segmentCopy = {
		individuals: {
			label: translator.t('transparency-page.inflows.segments.individuals.label'),
			description: translator.t('transparency-page.inflows.segments.individuals.description'),
		},
		foundations: {
			label: translator.t('transparency-page.inflows.segments.foundations.label'),
			description: translator.t('transparency-page.inflows.segments.foundations.description'),
		},
		corporate: {
			label: translator.t('transparency-page.inflows.segments.corporate.label'),
			description: translator.t('transparency-page.inflows.segments.corporate.description'),
		},
	} as const;

	const segments: InflowsSectionSegment[] = computedSegments.map((segment) => ({
		key: segment.key,
		label: segmentCopy[segment.key].label,
		description: segmentCopy[segment.key].description,
		amountLabel: formatAmount(segment.amount),
		percent: segment.percent,
		color: segment.color,
	}));

	const explainerVideo = getDonationExplainerVideo(lang);

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<InflowsSection
				lang={lang}
				totalAmount={total}
				videoEmbedUrl={explainerVideo.embedUrl}
				videoThumbnailSrc={explainerVideo.thumbnailSrc}
				segments={segments}
				copy={{
					eyebrow: translator.t('transparency-page.inflows.eyebrow'),
					headlineBeforeBold: translator.t('transparency-page.inflows.headline-before'),
					headlineBold: translator.t('transparency-page.inflows.headline-bold'),
					headlineAfterBold: translator.t('transparency-page.inflows.headline-after'),
					videoLabel: translator.t('transparency-page.inflows.video-label'),
					breakdownTitle: translator.t('transparency-page.inflows.breakdown-title'),
					totalLabel: translator.t('transparency-page.inflows.total-label'),
					totalCurrencyLabel: translator.t('transparency-page.inflows.title-currency', {
						context: { currency },
					}),
				}}
			/>
		</BlockWrapper>
	);
};
