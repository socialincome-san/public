import { formatPlaybackMonthLabel } from '@/components/donation-globe/build-timeline-month-markers';
import { createComet, type Comet } from '@/components/donation-globe/create-comet';
import type {
	DonationFlow,
	GlobeHtmlElement,
	GlobeInstance,
	PlaybackTimelineUpdate,
} from '@/components/donation-globe/types';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { useEffect, useRef } from 'react';

import { COMET_DURATION_MS } from '@/components/donation-globe/create-comet';

export const PLAYBACK_DURATION_MS = 60_000;
const BADGE_VISIBLE_MS = 2500;
const LOOP_PAUSE_MS = 2000;
const COMET_END_BUFFER_MS = 300;
const TIMELINE_TICK_MS = 50;
const ARC_COLORS = ['#083344', '#1e293b'] as const;

type PlaybackTimeRange = {
	minDate: number;
	maxDate: number;
	range: number;
};

type UseDonationPlaybackOptions = {
	flows: DonationFlow[];
	periodStartIso: string;
	periodEndIso: string;
	globe: GlobeInstance | null;
	enabled: boolean;
	lang: WebsiteLanguage;
	onCometCreated: (comet: Comet) => void;
	onTimelineUpdate: (update: PlaybackTimelineUpdate) => void;
};

const getPlaybackTimeRange = (periodStartIso: string, periodEndIso: string): PlaybackTimeRange => {
	const minDate = new Date(periodStartIso).getTime();
	const maxDate = new Date(periodEndIso).getTime();

	return { minDate, maxDate, range: maxDate - minDate || 1 };
};

const scheduleFlowOffsets = (
	flows: DonationFlow[],
	timeRange: PlaybackTimeRange,
): { flow: DonationFlow; scheduledAtMs: number }[] =>
	flows.map((flow) => ({
		flow,
		scheduledAtMs: ((new Date(flow.createdAt).getTime() - timeRange.minDate) / timeRange.range) * PLAYBACK_DURATION_MS,
	}));

export const useDonationPlayback = ({
	flows,
	periodStartIso,
	periodEndIso,
	globe,
	enabled,
	lang,
	onCometCreated,
	onTimelineUpdate,
}: UseDonationPlaybackOptions): void => {
	const activeBadgesRef = useRef<GlobeHtmlElement[]>([]);
	const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
	const loopTimeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const timelineIntervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const loopStartMsRef = useRef(0);
	const generationRef = useRef(0);
	const onCometCreatedRef = useRef(onCometCreated);
	const onTimelineUpdateRef = useRef(onTimelineUpdate);
	const timeRangeRef = useRef<PlaybackTimeRange | null>(null);
	onCometCreatedRef.current = onCometCreated;
	onTimelineUpdateRef.current = onTimelineUpdate;
	timeRangeRef.current = getPlaybackTimeRange(periodStartIso, periodEndIso);

	const clearTimelineInterval = () => {
		if (timelineIntervalIdRef.current !== null) {
			clearInterval(timelineIntervalIdRef.current);
			timelineIntervalIdRef.current = null;
		}
	};

	const emitTimeline = (progress: number) => {
		const timeRange = timeRangeRef.current;
		if (!timeRange) {
			return;
		}

		const simulatedAt = new Date(timeRange.minDate + progress * timeRange.range);
		onTimelineUpdateRef.current({
			progress,
			currentMonthLabel: formatPlaybackMonthLabel(simulatedAt, lang),
		});
	};

	const startTimelineTicker = (generation: number) => {
		clearTimelineInterval();
		loopStartMsRef.current = performance.now();
		emitTimeline(0);

		timelineIntervalIdRef.current = setInterval(() => {
			if (generationRef.current !== generation) {
				return;
			}

			const elapsed = performance.now() - loopStartMsRef.current;
			const progress = Math.min(elapsed / PLAYBACK_DURATION_MS, 1);
			emitTimeline(progress);
		}, TIMELINE_TICK_MS);
	};

	const clearScheduledTimeouts = () => {
		for (const timeoutId of timeoutIdsRef.current) {
			clearTimeout(timeoutId);
		}
		timeoutIdsRef.current = [];

		if (loopTimeoutIdRef.current !== null) {
			clearTimeout(loopTimeoutIdRef.current);
			loopTimeoutIdRef.current = null;
		}
	};

	const setBadges = (badges: GlobeHtmlElement[]) => {
		activeBadgesRef.current = badges;
		globe?.htmlElementsData(badges);
	};

	const stop = () => {
		generationRef.current += 1;
		clearScheduledTimeouts();
		clearTimelineInterval();
		setBadges([]);
		emitTimeline(0);
	};

	const startLoop = (generation: number) => {
		if (!globe || !enabled || flows.length === 0) {
			return;
		}

		const timeRange = timeRangeRef.current;
		if (!timeRange) {
			return;
		}

		startTimelineTicker(generation);
		const scheduledFlows = scheduleFlowOffsets(flows, timeRange);

		for (const { flow, scheduledAtMs } of scheduledFlows) {
			const badgeTimeoutId = setTimeout(() => {
				if (generationRef.current !== generation) {
					return;
				}

				const badge: GlobeHtmlElement = {
					id: flow.id,
					lat: flow.fromLat,
					lng: flow.fromLng,
					text: flow.label,
				};
				setBadges([...activeBadgesRef.current, badge]);

				const cometTimeoutId = setTimeout(() => {
					if (generationRef.current !== generation) {
						return;
					}

					setBadges(activeBadgesRef.current.filter((b) => b.id !== flow.id));

					const color = ARC_COLORS[Math.floor(Math.random() * ARC_COLORS.length)];
					onCometCreatedRef.current(createComet(globe, flow.fromLat, flow.fromLng, flow.toLat, flow.toLng, color));
				}, BADGE_VISIBLE_MS);

				timeoutIdsRef.current.push(cometTimeoutId);
			}, scheduledAtMs);

			timeoutIdsRef.current.push(badgeTimeoutId);
		}

		const lastScheduledAt = scheduledFlows.at(-1)?.scheduledAtMs ?? 0;
		const loopEndDelay = lastScheduledAt + BADGE_VISIBLE_MS + COMET_DURATION_MS * 1.3 + COMET_END_BUFFER_MS + LOOP_PAUSE_MS;

		loopTimeoutIdRef.current = setTimeout(() => {
			if (generationRef.current !== generation) {
				return;
			}

			setBadges([]);
			startLoop(generation);
		}, loopEndDelay);
	};

	useEffect(() => {
		if (!globe || !enabled || flows.length === 0) {
			stop();

			return stop;
		}

		const generation = generationRef.current + 1;
		generationRef.current = generation;
		clearScheduledTimeouts();
		startLoop(generation);

		return stop;
		// flows/globe/enabled only — playback helpers are stable via refs.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentional remount when data source changes
	}, [flows, globe, enabled, periodStartIso, periodEndIso]);
};
