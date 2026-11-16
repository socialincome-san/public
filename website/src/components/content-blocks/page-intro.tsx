import { BlockButton, hasBlockButton } from '@/components/content-blocks/block-button';
import { blockMargins } from '@/components/content-blocks/block-margins';
import { ExplainerVideoTrigger } from '@/components/explainer-video/explainer-video-trigger';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { PageIntro } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/url-video-parser';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro as PageIntroView } from '@socialincome/design-system/layout/page-intro/page-intro';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: PageIntro;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

const vimeoMatcher = new VimeoVideoMatchAndExtract();

export const PageIntroBlock = ({ blok, lang, currency }: Props) => {
	const button = blok.button?.[0];
	const buttonNode = hasBlockButton(button, blok.buttonAction, lang, currency) ? (
		<BlockButton button={button} action={blok.buttonAction} variant="default" lang={lang} currency={currency} />
	) : null;
	const videoLabel = blok.videoLabel?.trim();
	const videoUrl = blok.videoLink ? resolveStoryblokLink(blok.videoLink, lang, currency) : null;
	const videoEmbedUrl = videoUrl ? vimeoMatcher.parseUrl(videoUrl) : null;
	const videoNode =
		videoLabel && videoEmbedUrl ? (
			<ExplainerVideoTrigger
				layout="inline"
				label={videoLabel}
				embedUrl={videoEmbedUrl}
				thumbnailSrc={blok.videoThumbnail?.filename ?? undefined}
				thumbnailAlt={blok.videoThumbnail?.alt ?? undefined}
				dialogTitle={videoLabel}
			/>
		) : null;

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<PageIntroView
				variant="landing"
				title={blok.title?.trim() ? <StoryblokMarkdown>{blok.title}</StoryblokMarkdown> : undefined}
				description={blok.description}
				illustrationSrc={blok.image?.filename ?? undefined}
				actions={
					buttonNode || videoNode ? (
						<>
							{buttonNode}
							{videoNode}
						</>
					) : undefined
				}
				actionsPosition={blok.buttonPosition === 'right' ? 'beside' : 'below'}
			/>
		</BlockWrapper>
	);
};
