'use client';

import type { HeadingSize } from '@/components/heading-styles';
import {
	buildLinkRel,
	getRichTextAlignmentClassName,
	removeStoryblokPagesFolder,
	storyblokRichTextNodeResolvers,
	type RichTextAlignmentProps,
	type RichTextHeadingProps,
} from '@/components/storyblok/rich-text/shared-resolvers';
import { cn } from '@/lib/utils/cn';
import NextLink from 'next/link';
import { createElement, ReactNode } from 'react';
import {
	MARK_BOLD,
	MARK_LINK,
	NODE_HEADING,
	NODE_LI,
	NODE_OL,
	NODE_PARAGRAPH,
	NODE_UL,
} from 'storyblok-rich-text-react-renderer';

const journalHeadingStyles: Record<HeadingSize, string> = {
	1: 'text-5xl md:text-6xl',
	2: 'text-2xl md:text-3xl font-medium',
	3: 'text-xl md:text-2xl',
	4: 'text-lg md:text-xl',
	5: 'text-base md:text-lg',
	6: 'text-sm md:text-base',
};

const journalLinkClassName = 'text-primary underline underline-offset-4';

export const journalRichTextMarkResolvers = {
	[MARK_BOLD]: (children: ReactNode) => <strong className="font-medium text-inherit!">{children}</strong>,
	[MARK_LINK]: (children: ReactNode, props: { href?: string; target?: string; rel?: string }) => {
		const href = props.href?.trim();

		if (!href) {
			return <span className={journalLinkClassName}>{children}</span>;
		}

		return (
			<NextLink
				href={removeStoryblokPagesFolder(href)}
				className={cn(journalLinkClassName, 'hover:underline')}
				target={props.target}
				rel={buildLinkRel(props.target, props.rel)}
			>
				{children}
			</NextLink>
		);
	},
};

export const journalRichTextNodeResolvers = {
	...storyblokRichTextNodeResolvers,
	[NODE_HEADING]: (children: ReactNode, props: RichTextHeadingProps) =>
		createElement(
			`h${props.level}`,
			{ className: cn(journalHeadingStyles[props.level], 'my-4 text-foreground!', getRichTextAlignmentClassName(props)) },
			children,
		),
	[NODE_PARAGRAPH]: (children: ReactNode, props?: RichTextAlignmentProps) => (
		<p className={cn('my-4 text-lg leading-relaxed md:text-xl', getRichTextAlignmentClassName(props))}>{children}</p>
	),
	[NODE_UL]: (children: ReactNode) => <ul className="my-4 list-disc space-y-1 pl-6 text-lg md:text-xl">{children}</ul>,
	[NODE_OL]: (children: ReactNode) => <ol className="my-4 list-decimal space-y-1 pl-6 text-lg md:text-xl">{children}</ol>,
	[NODE_LI]: (children: ReactNode) => <li className="[&::marker]:text-foreground my-1 *:m-0 *:p-0">{children}</li>,
};
