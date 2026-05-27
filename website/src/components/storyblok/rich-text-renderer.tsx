import {
	storyblokRichTextBasicNodeResolvers,
	storyblokRichTextMarkResolvers,
} from '@/components/storyblok/rich-text/shared-resolvers';
import { ReactNode } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type RichTextRendererProps = {
	richTextDocument: StoryblokRichtext;
};

export const RichTextRenderer = ({ richTextDocument }: RichTextRendererProps) =>
	render(richTextDocument, {
		markResolvers: storyblokRichTextMarkResolvers,
		nodeResolvers: storyblokRichTextBasicNodeResolvers,
		blokResolvers: {},
	}) as ReactNode;
