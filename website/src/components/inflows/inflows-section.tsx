'use client';

import { ExplainerVideoTrigger } from '@/components/explainer-video/explainer-video-trigger';
import { InflowsGauge } from '@/components/inflows/inflows-gauge';
import type { InflowSegmentKey } from '@/components/inflows/inflows-segments';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';

export type InflowsSectionSegment = {
	key: InflowSegmentKey;
	label: string;
	description: string;
	amountLabel: string;
	percent: number;
	color: string;
};

type InflowsSectionCopy = {
	eyebrow: string;
	headlineBeforeBold: string;
	headlineBold: string;
	headlineAfterBold: string;
	videoLabel: string;
	breakdownTitle: string;
	totalLabel: string;
	totalCurrencyLabel: string;
};

type Props = {
	copy: InflowsSectionCopy;
	segments: InflowsSectionSegment[];
	totalAmount: number;
	videoEmbedUrl: string;
	videoThumbnailSrc: string;
	lang: WebsiteLanguage;
	className?: string;
};

export const InflowsSection = ({
	copy,
	segments,
	totalAmount,
	videoEmbedUrl,
	videoThumbnailSrc,
	lang,
	className,
}: Props) => {
	return (
		<section className={cn('grid gap-8 py-6 sm:grid-cols-2 sm:items-start sm:gap-12 md:gap-20 md:py-10', className)}>
			<div className="flex max-w-3xl flex-col gap-3 sm:pt-8">
				<p className="text-sm font-medium text-cyan-900">{copy.eyebrow}</p>
				<h2 className="text-foreground text-4xl leading-tight font-normal md:text-5xl md:leading-[54px]">
					{copy.headlineBeforeBold}
					<span className="font-bold">{copy.headlineBold}</span>
					{copy.headlineAfterBold}
				</h2>
				<ExplainerVideoTrigger
					layout="row"
					className="mt-4 flex w-auto items-center gap-3 border-0 px-0 py-0 hover:bg-transparent"
					label={copy.videoLabel}
					embedUrl={videoEmbedUrl}
					thumbnailSrc={videoThumbnailSrc}
					thumbnailAlt={copy.videoLabel}
					dialogTitle={copy.videoLabel}
				/>
			</div>

			<div className="relative flex w-full flex-col items-center gap-8 rounded-[32px] bg-white px-6 pt-6 pb-8 shadow-[0px_0px_20px_rgba(0,0,0,0.05)] sm:px-8 sm:pt-7 sm:pb-10">
				<h3 className="w-full text-2xl leading-none font-medium text-cyan-950">{copy.breakdownTitle}</h3>
				<InflowsGauge
					segments={segments}
					centerValue={totalAmount}
					centerLabel={copy.totalLabel}
					centerCurrencyLabel={copy.totalCurrencyLabel}
					lang={lang}
					className="w-full"
				/>
				<ul className="flex w-full flex-col gap-6">
					{segments.map((seg) => (
						<li key={seg.key} className="flex flex-col gap-1">
							<div className="flex items-center justify-between gap-4">
								<div className="flex min-w-0 items-center gap-2">
									<span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} aria-hidden />
									<span className="text-foreground text-base font-semibold">{seg.label}</span>
								</div>
								<span className="text-foreground shrink-0 text-base font-semibold tabular-nums">{seg.percent}%</span>
							</div>
							<p className="text-muted-foreground text-sm leading-5">
								{seg.description}: {seg.amountLabel}
							</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};
