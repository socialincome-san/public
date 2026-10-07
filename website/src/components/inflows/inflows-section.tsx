'use client';

import { ExplainerVideoTrigger } from '@/components/explainer-video/explainer-video-trigger';
import { InflowsGauge } from '@/components/inflows/inflows-gauge';
import type { InflowSegmentKey } from '@/components/inflows/inflows-segments';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { BreakdownList, BreakdownRow } from '@socialincome/design-system/data-display/breakdown-list/breakdown-list';
import { SplitSection, SplitSectionCard } from '@socialincome/design-system/layout/split-section/split-section';

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
};

export const InflowsSection = ({ copy, segments, totalAmount, videoEmbedUrl, videoThumbnailSrc, lang }: Props) => {
	return (
		<SplitSection
			eyebrow={copy.eyebrow}
			headline={
				<>
					{copy.headlineBeforeBold}
					<strong>{copy.headlineBold}</strong>
					{copy.headlineAfterBold}
				</>
			}
			intro={
				<ExplainerVideoTrigger
					layout="inline"
					label={copy.videoLabel}
					embedUrl={videoEmbedUrl}
					thumbnailSrc={videoThumbnailSrc}
					thumbnailAlt={copy.videoLabel}
					dialogTitle={copy.videoLabel}
				/>
			}
		>
			<SplitSectionCard title={copy.breakdownTitle} align="center">
				<InflowsGauge
					segments={segments}
					centerValue={totalAmount}
					centerLabel={copy.totalLabel}
					centerCurrencyLabel={copy.totalCurrencyLabel}
					lang={lang}
				/>
				<BreakdownList>
					{segments.map((seg) => (
						<BreakdownRow
							key={seg.key}
							label={seg.label}
							value={`${seg.percent}%`}
							description={`${seg.description}: ${seg.amountLabel}`}
							markerColor={seg.color}
						/>
					))}
				</BreakdownList>
			</SplitSectionCard>
		</SplitSection>
	);
};
