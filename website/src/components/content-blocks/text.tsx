import { Text } from '@/generated/storyblok/types/109655/storyblok-components';
import { MarkTypes, StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/react';
import NextLink from 'next/link';
import { ReactElement } from 'react';

type TextBlockProps = {
	blok: Text;
};

const resolvers = {
	[MarkTypes.LINK]: (node: StoryblokRichTextNode<ReactElement>) => (
		<NextLink href={node.attrs?.href} target={node.attrs?.target}>
			{node.text}
		</NextLink>
	),
};

export default function TextBlock({ blok }: TextBlockProps) {
	return (
		blok.content && (
			<StoryblokRichText doc={blok.content as StoryblokRichTextNode<ReactElement>} resolvers={resolvers} />
		)
	);
}
