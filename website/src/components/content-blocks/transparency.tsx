import type { Transparency } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { DateTime } from 'luxon';

import { CountriesSection } from '@/app/[lang]/[region]/new-website/transparency/finances/[currency]/(sections)/countries-section';
import { TimeSeriesSection } from '@/app/[lang]/[region]/new-website/transparency/finances/[currency]/(sections)/time-series-section';
import { TotalsSection } from '@/app/[lang]/[region]/new-website/transparency/finances/[currency]/(sections)/totals-section';

type Props = {
	blok: Transparency;
	lang: WebsiteLanguage;
};

export const TransparencyBlock = async ({ blok, lang }: Props) => {
	const timeRanges = Array.from({ length: 12 }, (_, i) => {
		const start = DateTime.now()
			.minus({ months: 11 - i })
			.startOf('month');
		const end = start.endOf('month');

		return { start, end };
	});

	const dataResult = await services.transparency.getTransparencyData(timeRanges);

	if (!dataResult.success) {
		return null;
	}

	const data = dataResult.data;

	const serializedTimeRanges = data.timeRanges.map((range) => ({
		startIso: range.start.toISO()!,
		totalChf: range.totalChf,
	}));

	return (
		<div className="w-site-width max-w-content mx-auto space-y-12 py-12" {...storyblokEditable(blok as SbBlokData)}>
			<TotalsSection totals={data.totals} lang={lang} />
			<TimeSeriesSection timeRanges={serializedTimeRanges} lang={lang} />
			<CountriesSection countries={data.topCountries} lang={lang} />
		</div>
	);
};
