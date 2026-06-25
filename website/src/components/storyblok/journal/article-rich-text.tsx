'use client';

import { ActionButtonBlock } from '@/components/storyblok/journal/rich-text/action-button';
import { EmbeddedVideoPlayer } from '@/components/storyblok/journal/rich-text/embedded-video';
import { ImageWithCaption } from '@/components/storyblok/journal/rich-text/image-with-caption';
import { NewsletterSignup } from '@/components/storyblok/journal/rich-text/newsletter-signup';
import { QuotedText } from '@/components/storyblok/journal/rich-text/quoted-text';
import { ReferencesGroupBlock } from '@/components/storyblok/journal/rich-text/references-group';
import {
	storyblokRichTextMarkResolvers,
	storyblokRichTextNodeResolvers,
} from '@/components/storyblok/rich-text/shared-resolvers';
import { useTranslator } from '@/lib/hooks/useTranslator';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { ComponentProps, ReactNode } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type StoryblokBlockProps = Record<string, unknown>;

type Props = {
	document: StoryblokRichtext;
	lang: WebsiteLanguage;
	donationForm: ReactNode;
};

const buildReferenceLabels = (translator: Translator) => ({
	showMore: translator.t('reference-article.show-more'),
	showLess: translator.t('reference-article.show-less'),
	author: (author: string) => translator.t('reference-article.author', { context: { author } }),
	publicationDate: (publicationDate: string) =>
		translator.t('reference-article.publication-date', { context: { publicationDate } }),
	context: (contextKey: string) => translator.t(`reference-article.context.${contextKey}`),
});

export const ArticleRichText = ({ document, lang, donationForm }: Props) => {
	const journalTranslator = useTranslator(lang, 'website-journal');

	if (!journalTranslator) {
		return null;
	}

	const referenceLabels = buildReferenceLabels(journalTranslator);

	return render(document, {
		markResolvers: storyblokRichTextMarkResolvers,
		nodeResolvers: storyblokRichTextNodeResolvers,
		blokResolvers: {
			quotedText: (props: StoryblokBlockProps) => <QuotedText {...(props as ComponentProps<typeof QuotedText>)} />,
			imageWithCaption: (props: StoryblokBlockProps) => (
				<ImageWithCaption {...(props as ComponentProps<typeof ImageWithCaption>)} />
			),
			embeddedVideo: (props: StoryblokBlockProps) => (
				<EmbeddedVideoPlayer {...(props as ComponentProps<typeof EmbeddedVideoPlayer>)} />
			),
			referencesGroup: (props: StoryblokBlockProps) => (
				<ReferencesGroupBlock
					{...(props as ComponentProps<typeof ReferencesGroupBlock>)}
					lang={lang}
					labels={referenceLabels}
				/>
			),
			actionButton: (props: StoryblokBlockProps) => (
				<ActionButtonBlock {...(props as ComponentProps<typeof ActionButtonBlock>)} />
			),
			newsletterSignup: () => <NewsletterSignup lang={lang} />,
			campaignDonate: () => <div className="my-10">{donationForm}</div>,
		},
	}) as ReactNode;
};
