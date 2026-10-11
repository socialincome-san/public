'use client';

import { LottieBlock } from '@/components/content-blocks/lottie';
import { ActionButtonBlock } from '@/components/storyblok/journal/rich-text/action-button';
import { BannerSectionBlock } from '@/components/storyblok/journal/rich-text/banner-section';
import { EmbeddedVideoPlayer } from '@/components/storyblok/journal/rich-text/embedded-video';
import { ImageWithCaption } from '@/components/storyblok/journal/rich-text/image-with-caption';
import { NewsletterSignup } from '@/components/storyblok/journal/rich-text/newsletter-signup';
import { QuotedText } from '@/components/storyblok/journal/rich-text/quoted-text';
import { ReferencesGroupBlock } from '@/components/storyblok/journal/rich-text/references-group';
import {
	footnoteRichTextMarkResolvers,
	footnoteRichTextNodeResolvers,
	journalRichTextMarkResolvers as storyblokRichTextMarkResolvers,
	journalRichTextNodeResolvers as storyblokRichTextNodeResolvers,
} from '@/components/storyblok/rich-text/journal-resolvers';
import type { Lottie } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { ComponentProps, ReactNode } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type StoryblokBlockProps = Record<string, unknown>;

type Props = {
	document: StoryblokRichtext;
	lang: WebsiteLanguage;
	donationForm: ReactNode;
	variant?: 'article' | 'footnotes';
};

export const ArticleRichText = ({ document, lang, donationForm, variant = 'article' }: Props) => {
	const isFootnotes = variant === 'footnotes';

	return render(document, {
		markResolvers: isFootnotes ? footnoteRichTextMarkResolvers : storyblokRichTextMarkResolvers,
		nodeResolvers: isFootnotes ? footnoteRichTextNodeResolvers : storyblokRichTextNodeResolvers,
		blokResolvers: {
			quotedText: (props: StoryblokBlockProps) => <QuotedText {...(props as ComponentProps<typeof QuotedText>)} />,
			bannerSection: (props: StoryblokBlockProps) => (
				<BannerSectionBlock {...(props as ComponentProps<typeof BannerSectionBlock>)} />
			),
			imageWithCaption: (props: StoryblokBlockProps) => (
				<ImageWithCaption {...(props as ComponentProps<typeof ImageWithCaption>)} />
			),
			embeddedVideo: (props: StoryblokBlockProps) => (
				<EmbeddedVideoPlayer {...(props as ComponentProps<typeof EmbeddedVideoPlayer>)} />
			),
			referencesGroup: (props: StoryblokBlockProps) => (
				<ReferencesGroupBlock {...(props as ComponentProps<typeof ReferencesGroupBlock>)} lang={lang} />
			),
			actionButton: (props: StoryblokBlockProps) => (
				<ActionButtonBlock {...(props as ComponentProps<typeof ActionButtonBlock>)} />
			),
			lottie: (props: StoryblokBlockProps) => <LottieBlock blok={props as Lottie} />,
			newsletterSignup: () => <NewsletterSignup lang={lang} />,
			campaignDonate: () => <div className="my-10">{donationForm}</div>,
		},
	}) as ReactNode;
};
