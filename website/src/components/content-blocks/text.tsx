import { MarkTypes, StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/react';
import type { Text } from '@storyblok/types/109655/storyblok-components';
import NextLink from 'next/link';
import { ReactElement } from 'react';

type TextBlockProps = {
	blok: Text;
};

const resolvers = {
	[MarkTypes.LINK]: (node: StoryblokRichTextNode<ReactElement>) => {
		return node.attrs?.linktype === 'story' ? (
			<NextLink href={node.attrs?.href} target={node.attrs?.target}>
				{node.text}
			</NextLink>
		) : (
			<a href={node.attrs?.href} target={node.attrs?.target}>
				{node.text}
			</a>
		);
	},
};

export default function TextBlock({ blok }: TextBlockProps) {
	return blok.content ? (
		<StoryblokRichText doc={blok.content as StoryblokRichTextNode<ReactElement>} resolvers={resolvers} />
	) : null;
}
