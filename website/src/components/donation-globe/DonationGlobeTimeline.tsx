import type { PlaybackTimelineUpdate, TimelineMonthMarker } from '@/components/donation-globe/types';

type DonationGlobeTimelineProps = {
	markers: TimelineMonthMarker[];
	timeline: PlaybackTimelineUpdate | null;
};

export const DonationGlobeTimeline = ({ markers, timeline }: DonationGlobeTimelineProps) => {
	const progressPercent = (timeline?.progress ?? 0) * 100;

	return (
		<div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-8 md:px-10 md:pb-10">
			<div className="mx-auto max-w-3xl rounded-lg bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm">
				<div className="mb-3 flex items-baseline justify-between gap-4">
					<p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Timeline</p>
					<p className="text-sm font-semibold text-[#083344] tabular-nums">{timeline?.currentMonthLabel ?? '—'}</p>
				</div>

				<div className="relative h-2 rounded-full bg-slate-200/90">
					<div
						className="absolute inset-y-0 left-0 rounded-full bg-[#083344]/80 transition-[width] duration-100 ease-linear"
						style={{ width: `${progressPercent}%` }}
					/>
					<div
						className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#083344] shadow-sm transition-[left] duration-100 ease-linear"
						style={{ left: `${progressPercent}%` }}
					/>
				</div>

				<div className="relative mt-2 h-5">
					{markers.map((marker) => (
						<span
							key={`${marker.label}-${marker.offset}`}
							className="absolute -translate-x-1/2 text-[10px] font-medium text-slate-500"
							style={{ left: `${marker.offset * 100}%` }}
						>
							{marker.label}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};
