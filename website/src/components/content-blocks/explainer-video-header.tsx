import { BlockWrapper } from '@/components/block-wrapper';
import { ExplainerVideoTrigger } from '@/components/explainer-video/explainer-video-trigger';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { ExplainerVideoHeader } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: ExplainerVideoHeader;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const vimeoMatcher = new VimeoVideoMatchAndExtract();

export const ExplainerVideoHeaderBlock = ({ blok, lang, region }: Props) => {
	const {
		disableMarginBottom,
		disableMarginTop,
		explainerVideoThumbnail,
		heading,
		labelForExplainerVideo,
		linkToExplainerVideo,
	} = blok;
	const headingText = heading?.trim();
	const explainerVideoLabel = labelForExplainerVideo?.trim();
	const resolvedExplainerVideoUrl = linkToExplainerVideo ? resolveStoryblokLink(linkToExplainerVideo, lang, region) : null;
	const explainerVideoEmbedUrl = resolvedExplainerVideoUrl ? vimeoMatcher.parseUrl(resolvedExplainerVideoUrl) : null;
	const hasExplainerVideo = Boolean(explainerVideoLabel && explainerVideoEmbedUrl);
	const explainerVideoThumbnailSrc = explainerVideoThumbnail?.filename;

	if (!headingText && !hasExplainerVideo) {
		return null;
	}

	return (
		<BlockWrapper
			disableMarginBottom={disableMarginBottom}
			disableMarginTop={disableMarginTop}
			{...storyblokEditable(blok as SbBlokData)}
		>
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				{headingText && (
					<div className="text-primary text-4xl whitespace-pre-line md:text-5xl [&_strong]:font-bold">
						<StoryblokMarkdown>{headingText}</StoryblokMarkdown>
					</div>
				)}
				{explainerVideoLabel && explainerVideoEmbedUrl && (
					<ExplainerVideoTrigger
						layout="stacked"
						label={explainerVideoLabel}
						embedUrl={explainerVideoEmbedUrl}
						thumbnailSrc={explainerVideoThumbnailSrc ?? undefined}
						thumbnailAlt={explainerVideoThumbnail?.alt ?? undefined}
						dialogTitle={explainerVideoLabel}
						className="self-center"
					/>
				)}
			</div>
		</BlockWrapper>
	);
};
