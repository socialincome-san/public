'use client';

import { LottieBlock } from '@/components/content-blocks/lottie';
import {
	storyblokRichTextBasicNodeResolvers,
	storyblokRichTextMarkResolvers,
} from '@/components/storyblok/rich-text/shared-resolvers';
import type { Lottie } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';
import { ReactNode } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';

type RichTextRendererProps = {
	richTextDocument: StoryblokRichtext;
};

export const RichTextRenderer = ({ richTextDocument }: RichTextRendererProps) =>
	render(richTextDocument, {
		markResolvers: storyblokRichTextMarkResolvers,
		nodeResolvers: storyblokRichTextBasicNodeResolvers,
		blokResolvers: {
			lottie: (props) => <LottieBlock blok={props as Lottie} />,
		},
	}) as ReactNode;
