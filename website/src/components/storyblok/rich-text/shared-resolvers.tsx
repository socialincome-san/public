'use client';

import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { cn } from '@/lib/utils/cn';
import NextLink from 'next/link';
import { createElement, ReactNode } from 'react';
import {
	MARK_LINK,
	NODE_HEADING,
	NODE_LI,
	NODE_OL,
	NODE_PARAGRAPH,
	NODE_TABLE,
	NODE_TABLE_CELL,
	NODE_TABLE_HEADER,
	NODE_TABLE_ROW,
	NODE_UL,
} from 'storyblok-rich-text-react-renderer';

type RichTextLinkProps = {
	href?: string;
	target?: string;
	rel?: string;
};

const linkClassName = 'text-primary font-medium underline underline-offset-4';

const buildLinkRel = (target?: string, rel?: string) => {
	if (target !== '_blank') {
		return rel;
	}

	const tokens = new Set(rel?.split(/\s+/).filter(Boolean) ?? []);
	tokens.add('noopener');
	tokens.add('noreferrer');

	return [...tokens].join(' ');
};

export const storyblokRichTextMarkResolvers = {
	[MARK_LINK]: (children: ReactNode, props: RichTextLinkProps) => {
		const href = props.href?.trim();

		if (!href) {
			return <span className={linkClassName}>{children}</span>;
		}

		return (
			<NextLink
				href={href}
				className={cn(linkClassName, 'hover:underline')}
				target={props.target}
				rel={buildLinkRel(props.target, props.rel)}
			>
				{children}
			</NextLink>
		);
	},
};

const headingStyles: Record<number, string> = {
	1: 'text-5xl',
	2: 'text-4xl',
	3: 'text-3xl',
	4: 'text-2xl',
	5: 'text-xl',
	6: 'text-lg',
};

export const storyblokRichTextBasicNodeResolvers = {
	[NODE_HEADING]: (children: ReactNode, { level }: { level: number }) =>
		createElement(`h${level}`, { className: cn(headingStyles[level], 'my-4') }, children),
	[NODE_UL]: (children: ReactNode) => <ul className="text-foreground my-4 list-disc space-y-1 pl-6">{children}</ul>,
	[NODE_OL]: (children: ReactNode) => <ol className="text-foreground my-4 list-decimal space-y-1 pl-6">{children}</ol>,
	[NODE_LI]: (children: ReactNode) => <li className="[&::marker]:text-foreground my-1 *:m-0 *:p-0">{children}</li>,
	[NODE_PARAGRAPH]: (children: ReactNode) => <p className="text-foreground my-4">{children}</p>,
};

const storyblokRichTextTableNodeResolvers = {
	[NODE_TABLE]: (children: ReactNode) => (
		<Table className="text-foreground my-6">
			<TableBody>{children}</TableBody>
		</Table>
	),
	[NODE_TABLE_HEADER]: (children: ReactNode) => <TableHead className="font-bold">{children}</TableHead>,
	[NODE_TABLE_ROW]: (children: ReactNode) => <TableRow>{children}</TableRow>,
	[NODE_TABLE_CELL]: (children: ReactNode) => <TableCell>{children}</TableCell>,
};

export const storyblokRichTextNodeResolvers = {
	...storyblokRichTextBasicNodeResolvers,
	...storyblokRichTextTableNodeResolvers,
};
