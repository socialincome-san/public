'use client';

import { formatSummaryMetricAmount } from '@/components/transparency/summary-metric-format';
import { useCountUp } from '@/lib/hooks/use-count-up';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { useInView } from 'motion/react';
import { useRef } from 'react';

export type SummaryMetric = {
	key: 'inflows' | 'outflows' | 'reserves';
	titleName: string;
	titleCurrency: string;
	description: string;
	amount: number;
};

type Props = {
	metrics: SummaryMetric[];
	lang: WebsiteLanguage;
};

const SummaryMetricValue = ({ amount, lang }: { amount: number; lang: WebsiteLanguage }) => {
	const locale = getSafeNumberFormatLocale(lang);
	const sectionRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
	const animatedValue = useCountUp(amount, isInView);
	const displayValue = isInView ? animatedValue : amount;
	const { value, suffix } = formatSummaryMetricAmount(displayValue, locale);

	return (
		<div ref={sectionRef} className="mt-auto flex items-baseline pt-12">
			<span className="text-6xl font-light tracking-tight">{value}</span>
			{suffix ? <span className="text-3xl font-light tracking-tight">{suffix}</span> : null}
		</div>
	);
};

export const SummarySectionClient = ({ metrics, lang }: Props) => {
	return (
		<section>
			<div className="grid gap-8 md:grid-cols-3">
				{metrics.map(({ key, titleName, titleCurrency, description, amount }) => (
					<div key={key} className="border-muted-foreground/30 text-foreground flex flex-col border-l pl-6">
						<h2>
							<strong>{titleName}</strong> {titleCurrency}
						</h2>
						<p className="mt-2 text-sm">{description}</p>
						<SummaryMetricValue amount={amount} lang={lang} />
					</div>
				))}
			</div>
		</section>
	);
};
