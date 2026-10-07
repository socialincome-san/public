import { ExplainerVideoTrigger } from '@/components/explainer-video/explainer-video-trigger';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { ExplainerVideoHeader } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/url-video-parser';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: ExplainerVideoHeader;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const vimeoMatcher = new VimeoVideoMatchAndExtract();

export const ExplainerVideoHeaderBlock = ({ blok, lang, region }: Props) => {
	const { marginBottom, marginTop, explainerVideoThumbnail, heading, labelForExplainerVideo, linkToExplainerVideo } = blok;
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
		<BlockWrapper marginBottom={marginBottom} marginTop={marginTop} {...storyblokEditable(blok)}>
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
					/>
				)}
			</div>
		</BlockWrapper>
	);
};
