'use client';

import { Card } from '@/components/card';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { DateTime } from 'luxon';
import { useState } from 'react';

type SerializedTimeRange = {
	startIso: string;
	totalChf: number;
};

type TimeSeriesSectionProps = {
	timeRanges: SerializedTimeRange[];
	exchangeRate: number;
	currency: WebsiteCurrency;
	lang: WebsiteLanguage;
};

export const TimeSeriesSection = ({ timeRanges, exchangeRate, currency, lang }: TimeSeriesSectionProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const convertedRanges = timeRanges.map((range) => {
		const start = DateTime.fromISO(range.startIso, { setZone: true });
		return {
			startIso: range.startIso,
			total: range.totalChf * exchangeRate,
			label: start.toFormat('MMM'),
			fullLabel: start.toFormat('MMMM yyyy'),
		};
	});

	const maxValue = Math.max(...convertedRanges.map((r) => r.total), 1);

	return (
		<section>
			<h2 className="mb-6 text-2xl font-semibold">Monthly Contributions</h2>
			<Card>
				<div className="flex h-64 items-end gap-2">
					{convertedRanges.map((range, index) => {
						const heightPercent = (range.total / maxValue) * 100;
						const isHovered = hoveredIndex === index;

						return (
							<div
								key={range.startIso}
								className="relative flex flex-1 flex-col items-center"
								onMouseEnter={() => setHoveredIndex(index)}
								onMouseLeave={() => setHoveredIndex(null)}
							>
								{isHovered && (
									<div className="bg-popover text-popover-foreground absolute -top-16 z-10 rounded-md border px-3 py-2 text-sm shadow-md">
										<div className="font-medium">{range.fullLabel}</div>
										<div>{formatCurrencyLocale(range.total, currency, lang)}</div>
									</div>
								)}
								<div className="relative flex h-48 w-full items-end justify-center">
									<div
										className={cn('bg-primary w-full max-w-8 rounded-t transition-all', isHovered && 'bg-primary/80')}
										style={{ height: `${Math.max(heightPercent, 2)}%` }}
									/>
								</div>
								<span className="text-muted-foreground mt-2 text-xs">{range.label}</span>
							</div>
						);
					})}
				</div>
			</Card>
		</section>
	);
}
