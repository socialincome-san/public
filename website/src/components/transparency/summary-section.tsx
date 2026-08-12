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
	updatedAt: Date | null;
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
	const dateFormatter = new Intl.DateTimeFormat('de-CH', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		timeZone: 'Europe/Zurich',
	});
	const reserveTooltipRows = reserveAccounts.map(({ bankAccountId, bankAccountNumber, description, amount, updatedAt }) => ({
		key: bankAccountId,
		account: [bankAccountNumber, description].find((value) => value?.trim())?.trim() ?? noData,
		balance: amount ? formatCurrencyLocale(amount.amount, amount.currency, locale, { maximumFractionDigits: 0 }) : noData,
		updatedAt: updatedAt ? dateFormatter.format(updatedAt) : noData,
	}));
	const metricSources: { key: SummaryMetric['key']; displayAmount: DisplayAmount }[] = [
		{ key: 'inflows', displayAmount: inflows },
		{ key: 'outflows', displayAmount: outflows },
		{ key: 'reserves', displayAmount: reserves },
	];
	const metrics: SummaryMetric[] = metricSources.map(({ key, displayAmount }) => {
		const metric = {
			key,
			titleName: translator.t(`transparency-page.${key}.title-name`),
			titleCurrency: translator.t(`transparency-page.${key}.title-currency`, {
				context: { currency: displayAmount.currency },
			}),
			description: translator.t(`transparency-page.${key}.description`),
			amount: displayAmount.amount,
		};

		return key === 'reserves'
			? {
					...metric,
					tooltip: {
						ariaLabel: translator.t('transparency-page.reserves.tooltip-label'),
						emptyMessage: noData,
						rows: reserveTooltipRows,
					},
				}
			: metric;
	});

	return <SummarySectionClient metrics={metrics} lang={lang} />;
};
