import { Text } from '@/generated/storyblok/types/109655/storyblok-components';
import { MarkTypes, StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/react';
import NextLink from 'next/link';
import { ReactElement } from 'react';

type TextBlockProps = {
	block: Text;
};

const resolvers = {
	[MarkTypes.LINK]: (node: StoryblokRichTextNode<ReactElement>) => (
		<NextLink href={node.attrs?.href} target={node.attrs?.target}>
			{node.text}
		</NextLink>
	),
};

export default function TextBlock({ block }: TextBlockProps) {
	return (
		block.content && (
			<StoryblokRichText doc={block.content as StoryblokRichTextNode<ReactElement>} resolvers={resolvers} />
		)
	);
}
