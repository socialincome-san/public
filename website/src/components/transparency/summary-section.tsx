import { SummarySectionClient, type SummaryMetric } from '@/components/transparency/summary-section-client';
import { Translator } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import type { DisplayAmount } from '@/lib/services/currency-display/currency-display.types';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';

type ReserveAccount = {
	bankAccountId: string;
	bankAccountNumber: string;
	description: string | null;
	amount: DisplayAmount | null;
	recordedAt: Date | null;
};

type Props = {
	inflows: DisplayAmount;
	outflows: DisplayAmount;
	reserves: DisplayAmount;
	reserveAccounts: ReserveAccount[];
	lang: WebsiteLanguage;
};

export const SummarySection = async ({ inflows, outflows, reserves, reserveAccounts, lang }: Props) => {
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
		description: translator.t(`transparency-page.${key}.description`),
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

	return <SummarySectionClient metrics={metrics} lang={lang} />;
};
