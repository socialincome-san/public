'use client';

import type { HeadingSize } from '@/components/heading-styles';
import type { RichTextAlignmentProps, RichTextHeadingProps } from '@/components/storyblok/rich-text/rich-text.types';
import {
	buildLinkRel,
	getRichTextAlignmentClassName,
	removeStoryblokPagesFolder,
	storyblokRichTextNodeResolvers,
} from '@/components/storyblok/rich-text/shared-resolvers';
import { Table, TableBody } from '@/components/table';
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
	NODE_TABLE,
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
const footnoteLinkClassName = 'text-inherit underline underline-offset-4';

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
	[MARK_LINK]: createLinkResolver(footnoteLinkClassName),
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
	[NODE_TABLE]: (children: ReactNode) => (
		<Table
			className={cn(
				'text-foreground my-6',
				// Cell content is rendered by the paragraph/list resolvers above, so scale it
				// down here to keep tables smaller than the article body text.
				'[&_li]:my-0 [&_ol]:my-0 [&_p]:my-0 [&_ul]:my-0',
				'text-base [&_ol]:text-base [&_p]:text-base [&_ul]:text-base',
				'md:text-lg md:[&_ol]:text-lg md:[&_p]:text-lg md:[&_ul]:text-lg',
			)}
		>
			<TableBody>{children}</TableBody>
		</Table>
	),
};

export const footnoteRichTextNodeResolvers = {
	...journalRichTextNodeResolvers,
	// Footnotes are already small, so keep the default table sizing instead of the article one.
	[NODE_TABLE]: storyblokRichTextNodeResolvers[NODE_TABLE],
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
