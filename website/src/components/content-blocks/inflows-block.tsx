import { getDonationExplainerVideo } from '@/components/donation-wizard/utils/donation-explainer-video';
import { InflowsSection, type InflowsSectionSegment } from '@/components/inflows/inflows-section';
import { buildInflowSegments, parseChfAmount, resolveInflowSegmentAmountsChf } from '@/components/inflows/inflows-segments';
import type { Inflows as InflowsBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getTransparencySummaryAction } from '@/modules/transparency/transparency.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: InflowsBlok;
	lang: WebsiteLanguage;
};

export const InflowsBlock = async ({ blok, lang }: Props) => {
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const [dataResult, t] = await Promise.all([getTransparencySummaryAction(), getTranslations('website-common')]);

	if (!dataResult.success) {
		return null;
	}

	const totalInflowsChf = dataResult.data.financialSummary.inflowsChf;
	const amountsChf = resolveInflowSegmentAmountsChf(
		totalInflowsChf,
		parseChfAmount(blok.foundationInflows),
		parseChfAmount(blok.corporatePartnerInflows),
	);

	const displayResult = await resolveChfAmountsAction({
		amounts: [totalInflowsChf, amountsChf.individuals, amountsChf.foundations, amountsChf.corporate],
		displayCurrency,
	});
	if (!displayResult.success) {
		return null;
	}
	const [totalInflows, individuals, foundations, corporate] = displayResult.data;
	if (!totalInflows || !individuals || !foundations || !corporate) {
		return null;
	}

	const computedSegments = buildInflowSegments({
		individuals: individuals.amount,
		foundations: foundations.amount,
		corporate: corporate.amount,
	});

	const locale = getSafeNumberFormatLocale(lang);
	const currency = totalInflows.currency;
	const formatAmount = (amount: number) => formatCurrencyLocale(amount, currency, locale, { maximumFractionDigits: 0 });

	const segmentCopy = {
		individuals: {
			label: t('transparency-page.inflows.segments.individuals.label'),
			description: t('transparency-page.inflows.segments.individuals.description'),
		},
		foundations: {
			label: t('transparency-page.inflows.segments.foundations.label'),
			description: t('transparency-page.inflows.segments.foundations.description'),
		},
		corporate: {
			label: t('transparency-page.inflows.segments.corporate.label'),
			description: t('transparency-page.inflows.segments.corporate.description'),
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
		<BlockWrapper {...storyblokEditable(blok)}>
			<InflowsSection
				lang={lang}
				totalAmount={totalInflows.amount}
				videoEmbedUrl={explainerVideo.embedUrl}
				videoThumbnailSrc={explainerVideo.thumbnailSrc}
				segments={segments}
				copy={{
					eyebrow: t('transparency-page.inflows.eyebrow'),
					headlineBeforeBold: t('transparency-page.inflows.headline-before'),
					headlineBold: t('transparency-page.inflows.headline-bold'),
					headlineAfterBold: t('transparency-page.inflows.headline-after'),
					videoLabel: t('transparency-page.inflows.video-label'),
					breakdownTitle: t('transparency-page.inflows.breakdown-title'),
					totalLabel: t('transparency-page.inflows.total-label'),
					totalCurrencyLabel: t('transparency-page.inflows.title-currency', { currency }),
				}}
			/>
		</BlockWrapper>
	);
};
