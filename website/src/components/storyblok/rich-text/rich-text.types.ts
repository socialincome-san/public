import type { HeadingSize } from '@/components/heading-styles';

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
