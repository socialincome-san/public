'use client';

import type { HeadingSize } from '@/components/heading-styles';
import type { RichTextAlignmentProps, RichTextHeadingProps } from '@/components/storyblok/rich-text/rich-text.types';
import {
	buildLinkRel,
	getRichTextAlignmentClassName,
	removeStoryblokPagesFolder,
	storyblokRichTextNodeResolvers,
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
const inheritColorLinkClassName = 'text-inherit underline underline-offset-4';

const createLinkResolver =
	(className: string) => (children: ReactNode, props: { href?: string; target?: string; rel?: string }) => {
		const href = props.href?.trim();

		if (!href) {
			return <span className={className}>{children}</span>;
		}

		return (
			<NextLink
				href={removeStoryblokPagesFolder(href)}
				className={cn(className, 'hover:underline')}
				target={props.target}
				rel={buildLinkRel(props.target, props.rel)}
			>
				{children}
			</NextLink>
		);
	};

export const journalRichTextMarkResolvers = {
	[MARK_BOLD]: (children: ReactNode) => <strong className="font-medium text-inherit!">{children}</strong>,
	[MARK_LINK]: createLinkResolver(journalLinkClassName),
};

export const footnoteRichTextMarkResolvers = {
	...journalRichTextMarkResolvers,
	[MARK_LINK]: createLinkResolver(inheritColorLinkClassName),
};

export const bannerRichTextMarkResolvers = {
	...journalRichTextMarkResolvers,
	[MARK_LINK]: createLinkResolver(inheritColorLinkClassName),
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

// Font size stays on the banner itself, which switches it on the `smallText` flag.
export const bannerRichTextNodeResolvers = {
	...journalRichTextNodeResolvers,
	[NODE_PARAGRAPH]: (children: ReactNode, props?: RichTextAlignmentProps) => (
		<p className={cn('my-4 leading-normal first:mt-0 last:mb-0', getRichTextAlignmentClassName(props))}>{children}</p>
	),
};

export const footnoteRichTextNodeResolvers = {
	...journalRichTextNodeResolvers,
	[NODE_HEADING]: (children: ReactNode, props: RichTextHeadingProps) =>
		createElement(
			`h${props.level}`,
			{ className: cn('my-1 text-muted-foreground leading-snug', getRichTextAlignmentClassName(props)) },
			children,
		),
	[NODE_PARAGRAPH]: (children: ReactNode, props?: RichTextAlignmentProps) => (
		<p className={cn('text-muted-foreground my-1 leading-snug', getRichTextAlignmentClassName(props))}>{children}</p>
	),
	[NODE_UL]: (children: ReactNode) => <ul className="text-muted-foreground my-1 list-disc pl-6 leading-snug">{children}</ul>,
	[NODE_OL]: (children: ReactNode) => (
		<ol className="text-muted-foreground my-1 list-decimal pl-6 leading-snug">{children}</ol>
	),
	[NODE_LI]: (children: ReactNode) => <li className="[&::marker]:text-muted-foreground">{children}</li>,
};
