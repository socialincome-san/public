'use client';

import { buildTimelineMonthMarkers } from '@/components/donation-globe/build-timeline-month-markers';
import { DonationGlobeTimeline } from '@/components/donation-globe/DonationGlobeTimeline';
import type { DonationFlow, DonationGlobeStats, PlaybackTimelineUpdate } from '@/components/donation-globe/types';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { DateTime } from 'luxon';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

const DonationGlobe = dynamic(() => import('@/components/donation-globe/DonationGlobe').then((mod) => mod.DonationGlobe), {
	ssr: false,
});

type DonationGlobeSectionProps = {
	flows: DonationFlow[];
	stats: DonationGlobeStats;
	lang: WebsiteLanguage;
};

const localeForLang = (lang: WebsiteLanguage): string => (lang === 'de' ? 'de-CH' : 'en-US');

const formatPeriod = (iso: string, lang: WebsiteLanguage): string => {
	const dt = DateTime.fromISO(iso);

	return dt.setLocale(lang === 'de' ? 'de' : 'en').toLocaleString(DateTime.DATE_MED);
};

export const DonationGlobeSection = ({ flows, stats, lang }: DonationGlobeSectionProps) => {
	const hasFlows = flows.length > 0;
	const periodLabel = `${formatPeriod(stats.periodStart, lang)} – ${formatPeriod(stats.periodEnd, lang)}`;
	const [timeline, setTimeline] = useState<PlaybackTimelineUpdate | null>(null);
	const monthMarkers = useMemo(
		() => buildTimelineMonthMarkers(stats.periodStart, stats.periodEnd, lang),
		[stats.periodStart, stats.periodEnd, lang],
	);

	return (
		<section
			className="relative min-h-dvh w-full overflow-hidden"
			style={{
				background: 'linear-gradient(135deg, #FEF7EA 0%, #EEF4F8 50%, #E3EDF4 100%)',
			}}
		>
			<DonationGlobe
				flows={flows}
				periodStartIso={stats.periodStart}
				periodEndIso={stats.periodEnd}
				lang={lang}
				onTimelineUpdate={setTimeline}
			/>

			{hasFlows ? <DonationGlobeTimeline markers={monthMarkers} timeline={timeline} /> : null}

			<div className="pointer-events-none relative z-10 p-6 md:p-10">
				<div className="max-w-sm rounded-lg bg-white/80 p-5 shadow-sm backdrop-blur-sm">
					<h1 className="text-xl font-semibold text-[#083344]">Donations around the world</h1>
					<p className="mt-1 text-sm text-slate-600">Successful contributions from the last 12 months</p>

					{hasFlows ? (
						<dl className="mt-4 space-y-2 text-sm text-slate-700">
							<div className="flex justify-between gap-4">
								<dt>Contributions shown</dt>
								<dd className="font-medium tabular-nums">{stats.count}</dd>
							</div>
							<div className="flex justify-between gap-4">
								<dt>Total (CHF)</dt>
								<dd className="font-medium tabular-nums">
									{formatCurrencyLocale(stats.totalAmountChf, 'CHF', localeForLang(lang))}
								</dd>
							</div>
							<div className="flex justify-between gap-4">
								<dt>Period</dt>
								<dd className="font-medium">{periodLabel}</dd>
							</div>
							<p className="pt-2 text-xs text-slate-500">Playing 12 months in 60 seconds</p>
						</dl>
					) : (
						<p className="mt-4 text-sm text-slate-600">No donations found for the selected period.</p>
					)}
				</div>
			</div>
		</section>
	);
};
