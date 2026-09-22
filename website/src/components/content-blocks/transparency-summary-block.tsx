import { BlockWrapper } from '@/components/block-wrapper';
import { SummarySectionClient, type SummaryMetric } from '@/components/transparency/summary-section-client';
import type { TransparencySummary } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { Translator } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import type { DisplayAmount } from '@/modules/currency-display/currency-display.types';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type ReserveAccount = {
	bankAccountId: string;
	bankAccountNumber: string | null;
	description: string | null;
	amount: DisplayAmount | null;
	recordedAt: Date | null;
};

type Props = {
	blok: TransparencySummary;
	lang: WebsiteLanguage;
};

export const TransparencySummaryBlock = async ({ blok, lang }: Props) => {
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const dataResult = await services.transparency.getTransparencySummary();

	if (!dataResult.success) {
		return null;
	}

	const { inflowsChf, outflowsChf, reservesChf } = dataResult.data.financialSummary;
	const reserveAmountsChf = dataResult.data.reserveAccounts.flatMap(({ amountChf }) =>
		amountChf === null ? [] : [amountChf],
	);
	const displayResult = await resolveChfAmountsAction({
		amounts: [inflowsChf, outflowsChf, reservesChf, ...reserveAmountsChf],
		displayCurrency,
	});
	if (!displayResult.success) {
		return null;
	}
	const [inflows, outflows, reserves, ...reserveDisplayAmounts] = displayResult.data;
	if (!inflows || !outflows || !reserves) {
		return null;
	}
	let reserveDisplayIndex = 0;
	const reserveAccounts: ReserveAccount[] = dataResult.data.reserveAccounts.map(({ amountChf, ...account }) => {
		const amount = amountChf === null ? null : (reserveDisplayAmounts[reserveDisplayIndex] ?? null);
		if (amountChf !== null) {
			reserveDisplayIndex += 1;
		}

		return { ...account, amount };
	});

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const locale = getSafeNumberFormatLocale(lang);
	const noData = translator.t('transparency-page.reserves.no-data');
	const dateFormatter = new Intl.DateTimeFormat(locale, {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		timeZone: 'Europe/Zurich',
	});
	const reserveTooltipRows = reserveAccounts.map(
		({ bankAccountId, bankAccountNumber, description, amount, recordedAt }) => ({
			key: bankAccountId,
			account: [description, bankAccountNumber].map((value) => value?.trim()).find(Boolean) ?? noData,
			balance: amount ? formatCurrencyLocale(amount.amount, amount.currency, locale, { maximumFractionDigits: 0 }) : noData,
			recordedAt: recordedAt ? dateFormatter.format(recordedAt) : noData,
		}),
	);
	const descriptions = {
		inflows: blok.inflowsDescription,
		outflows: blok.outflowsDescription,
		reserves: blok.reservesDescription,
	};
	const metrics: SummaryMetric[] = (
		[
			{ key: 'inflows', displayAmount: inflows },
			{ key: 'outflows', displayAmount: outflows },
			{ key: 'reserves', displayAmount: reserves },
		] as const
	).map(({ key, displayAmount }) => ({
		key,
		titleName: translator.t(`transparency-page.${key}.title-name`),
		titleCurrency: translator.t(`transparency-page.${key}.title-currency`, {
			context: { currency: displayAmount.currency },
		}),
		description: descriptions[key],
		amount: displayAmount.amount,
		...(key === 'reserves'
			? {
					tooltip: {
						ariaLabel: translator.t('transparency-page.reserves.tooltip-label'),
						emptyMessage: noData,
						rows: reserveTooltipRows,
					},
				}
			: {}),
	}));

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<SummarySectionClient metrics={metrics} lang={lang} />
		</BlockWrapper>
	);
};
