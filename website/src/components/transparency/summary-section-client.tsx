'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { formatSummaryMetricAmount } from '@/components/transparency/summary-metric-format';
import { useCountUp } from '@/lib/hooks/use-count-up';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { Info } from 'lucide-react';
import { useInView } from 'motion/react';
import { useRef } from 'react';

type SummaryMetricTooltip = {
	ariaLabel: string;
	emptyMessage: string;
	rows: {
		key: string;
		account: string;
		balance: string;
		updatedAt: string;
	}[];
};

export type SummaryMetric = {
	key: 'inflows' | 'outflows' | 'reserves';
	titleName: string;
	titleCurrency: string;
	description: string;
	amount: number;
	tooltip?: SummaryMetricTooltip;
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
				{metrics.map(({ key, titleName, titleCurrency, description, amount, tooltip }) => (
					<div key={key} className="border-muted-foreground/30 text-foreground flex flex-col border-l pl-6">
						<h2 className="flex items-center gap-1.5">
							<span>
								<strong>{titleName}</strong> {titleCurrency}
							</span>
							{tooltip ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											aria-label={tooltip.ariaLabel}
											className="text-muted-foreground hover:text-foreground focus-visible:ring-foreground inline-flex rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2"
										>
											<Info aria-hidden="true" className="size-4" />
										</button>
									</TooltipTrigger>
									<TooltipContent sideOffset={8} className="max-w-[calc(100vw-2rem)] px-4 py-3 text-sm sm:max-w-xl">
										{tooltip.rows.length > 0 ? (
											<ul className="space-y-1.5">
												{tooltip.rows.map((row) => (
													<li key={row.key} className="flex flex-wrap gap-x-1 tabular-nums">
														<span className="break-all">{row.account},</span>
														<span>{row.balance},</span>
														<span>{row.updatedAt}</span>
													</li>
												))}
											</ul>
										) : (
											<p>{tooltip.emptyMessage}</p>
										)}
									</TooltipContent>
								</Tooltip>
							) : null}
						</h2>
						<p className="mt-2 text-sm">{description}</p>
						<SummaryMetricValue amount={amount} lang={lang} />
					</div>
				))}
			</div>
		</section>
	);
};
