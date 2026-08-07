import { SummarySectionClient, type SummaryMetric } from '@/components/transparency/summary-section-client';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { DisplayAmount } from '@/lib/services/currency-display/currency-display.types';

type Props = {
	inflows: DisplayAmount;
	outflows: DisplayAmount;
	reserves: DisplayAmount;
	lang: WebsiteLanguage;
};

export const SummarySection = async ({ inflows, outflows, reserves, lang }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const metricSources: { key: SummaryMetric['key']; displayAmount: DisplayAmount }[] = [
		{ key: 'inflows', displayAmount: inflows },
		{ key: 'outflows', displayAmount: outflows },
		{ key: 'reserves', displayAmount: reserves },
	];
	const metrics: SummaryMetric[] = metricSources.map(({ key, displayAmount }) => ({
		key,
		titleName: translator.t(`transparency-page.${key}.title-name`),
		titleCurrency: translator.t(`transparency-page.${key}.title-currency`, {
			context: { currency: displayAmount.currency },
		}),
		description: translator.t(`transparency-page.${key}.description`),
		amount: displayAmount.amount,
	}));

	return <SummarySectionClient metrics={metrics} lang={lang} />;
};
