import type { HeadingSize } from '@socialincome/design-system/layout/section-heading/heading-styles';

export type RichTextLinkProps = {
	href?: string;
	target?: string;
	rel?: string;
};

export type RichTextAlignment = 'left' | 'center' | 'middle' | 'right';

export type RichTextAlignmentProps = {
	textAlign?: unknown;
	align?: unknown;
	alignment?: unknown;
};

export type RichTextHeadingProps = RichTextAlignmentProps & {
	level: HeadingSize;
};

export type RichTextTableCellProps = {
	colspan?: number;
	rowspan?: number;
	colwidth?: number[];
	backgroundColor?: string;
};
