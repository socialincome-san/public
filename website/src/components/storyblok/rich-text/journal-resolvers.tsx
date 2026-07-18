'use client';

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
import {
	storyblokRichTextNodeResolvers,
} from '@/components/storyblok/rich-text/shared-resolvers';
import type { HeadingSize } from '@/components/heading-styles';

const journalHeadingStyles: Record<HeadingSize, string> = {
	1: 'text-5xl md:text-6xl',
	2: 'text-2xl md:text-3xl font-medium',
	3: 'text-xl md:text-2xl',
	4: 'text-lg md:text-xl',
	5: 'text-base md:text-lg',
	6: 'text-sm md:text-base',
};

type RichTextAlignmentProps = {
	textAlign?: unknown;
	align?: unknown;
	alignment?: unknown;
};

type RichTextHeadingProps = RichTextAlignmentProps & {
	level: HeadingSize;
};

type RichTextAlignment = 'left' | 'center' | 'middle' | 'right';

const alignmentClassNames: Record<RichTextAlignment, string> = {
	left: 'text-left',
	center: 'text-center',
	middle: 'text-center',
	right: 'text-right',
};

const isRichTextAlignment = (value: unknown): value is RichTextAlignment =>
	value === 'left' || value === 'center' || value === 'middle' || value === 'right';

const getRichTextAlignmentClassName = ({ textAlign, align, alignment }: RichTextAlignmentProps = {}) => {
	const value = textAlign ?? align ?? alignment;
	return isRichTextAlignment(value) ? alignmentClassNames[value] : undefined;
};

const removeStoryblokPagesFolder = (href: string) => href.replace(/^(https?:\/\/[^/]+)?\/?pages(?=\/|$)/, '$1');

const journalLinkClassName = 'text-primary underline underline-offset-4';

export const journalRichTextMarkResolvers = {
	[MARK_BOLD]: (children: ReactNode) => <strong className="font-medium ![color:inherit]">{children}</strong>,
	[MARK_LINK]: (children: ReactNode, props: { href?: string; target?: string; rel?: string }) => {
		const href = props.href?.trim();

		if (!href) {
			return <span className={journalLinkClassName}>{children}</span>;
		}

		const rel =
			props.target === '_blank'
				? [...new Set([...(props.rel?.split(/\s+/).filter(Boolean) ?? []), 'noopener', 'noreferrer'])].join(' ')
				: props.rel;

		return (
			<NextLink
				href={removeStoryblokPagesFolder(href)}
				className={cn(journalLinkClassName, 'hover:underline')}
				target={props.target}
				rel={rel}
			>
				{children}
			</NextLink>
		);
	},
}

export const journalRichTextNodeResolvers = {
	...storyblokRichTextNodeResolvers,
	[NODE_HEADING]: (children: ReactNode, props: RichTextHeadingProps) =>
		createElement(
			`h${props.level}`,
			{ className: cn(journalHeadingStyles[props.level], 'my-4 !text-foreground', getRichTextAlignmentClassName(props)) },
			children,
		),

	[NODE_PARAGRAPH]: (children: ReactNode, props?: RichTextAlignmentProps) => (
		<p className={cn('my-4 text-lg md:text-xl leading-relaxed', getRichTextAlignmentClassName(props))}>
			{children}
		</p>
	),
	[NODE_UL]: (children: ReactNode) => <ul className="text-foreground my-4 list-disc space-y-1 pl-6 text-lg md:text-xl">{children}</ul>,
	[NODE_OL]: (children: ReactNode) => <ol className="text-foreground my-4 list-decimal space-y-1 pl-6 text-lg md:text-xl">{children}</ol>,
	[NODE_LI]: (children: ReactNode) => <li className="[&::marker]:text-foreground my-1 *:m-0 *:p-0">{children}</li>,
};
