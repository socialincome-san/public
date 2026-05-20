import { cn } from '@/lib/utils/cn';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@socialincome/ui';
import NextLink from 'next/link';
import { createElement, ReactNode } from 'react';
import {
	MARK_LINK,
	NODE_HEADING,
	NODE_LI,
	NODE_PARAGRAPH,
	NODE_TABLE,
	NODE_TABLE_CELL,
	NODE_TABLE_HEADER,
	NODE_TABLE_ROW,
} from 'storyblok-rich-text-react-renderer';

type RichTextLinkProps = {
	href?: string;
	target?: string;
	rel?: string;
};

export const storyblokRichTextMarkResolvers = {
	[MARK_LINK]: (children: ReactNode, props: RichTextLinkProps) => (
		<NextLink
			href={props.href ?? '#'}
			className="text-primary font-medium underline-offset-4 hover:underline"
			target={props.target}
			rel={props.rel}
		>
			{children}
		</NextLink>
	),
};

const headingStyles: Record<number, string> = {
	1: 'text-4xl font-bold',
	2: 'text-3xl font-bold',
	3: 'text-2xl font-semibold',
	4: 'text-xl font-semibold',
	5: 'text-lg font-medium',
	6: 'text-base font-medium',
};

export const storyblokRichTextBasicNodeResolvers = {
	[NODE_HEADING]: (children: ReactNode, { level }: { level: number }) =>
		createElement(`h${level}`, { className: cn(headingStyles[level], 'my-4') }, children),
	[NODE_LI]: (children: ReactNode) => <li className="[&::marker]:text-foreground my-1 *:m-0 *:p-0">{children}</li>,
	[NODE_PARAGRAPH]: (children: ReactNode) => <p className="my-4">{children}</p>,
};

const storyblokRichTextTableNodeResolvers = {
	[NODE_TABLE]: (children: ReactNode, props: Record<string, unknown>) => (
		<Table className="text-foreground my-6" {...(props as object)}>
			<TableBody>{children}</TableBody>
		</Table>
	),
	[NODE_TABLE_HEADER]: (children: ReactNode, props: Record<string, unknown>) => (
		<TableHead className="font-semibold" {...(props as object)}>
			{children}
		</TableHead>
	),
	[NODE_TABLE_ROW]: (children: ReactNode, props: Record<string, unknown>) => (
		<TableRow {...(props as object)}>{children}</TableRow>
	),
	[NODE_TABLE_CELL]: (children: ReactNode, props: Record<string, unknown>) => (
		<TableCell {...(props as object)}>{children}</TableCell>
	),
};

export const storyblokRichTextNodeResolvers = {
	...storyblokRichTextBasicNodeResolvers,
	...storyblokRichTextTableNodeResolvers,
};
