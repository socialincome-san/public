import type { TimelineMonthMarker } from '@/components/donation-globe/types';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { DateTime } from 'luxon';

export const buildTimelineMonthMarkers = (
	periodStartIso: string,
	periodEndIso: string,
	lang: WebsiteLanguage,
): TimelineMonthMarker[] => {
	const rangeStart = DateTime.fromISO(periodStartIso);
	const rangeEnd = DateTime.fromISO(periodEndIso);
	const locale = lang === 'de' ? 'de' : 'en';
	const rangeMs = rangeEnd.toMillis() - rangeStart.toMillis() || 1;

	let cursor = rangeStart.startOf('month');
	const end = rangeEnd.startOf('month');
	const markers: TimelineMonthMarker[] = [];

	while (cursor <= end) {
		markers.push({
			label: cursor.setLocale(locale).toFormat('MMM'),
			offset: (cursor.toMillis() - rangeStart.toMillis()) / rangeMs,
		});
		cursor = cursor.plus({ months: 1 });
	}

	return markers;
};

export const formatPlaybackMonthLabel = (simulatedAt: Date, lang: WebsiteLanguage): string => {
	const locale = lang === 'de' ? 'de' : 'en';

	return DateTime.fromJSDate(simulatedAt).setLocale(locale).toFormat('MMMM yyyy');
};
