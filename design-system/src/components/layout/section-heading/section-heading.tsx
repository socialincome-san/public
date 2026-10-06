import type { ReactNode } from 'react';
import { cn } from '../../../cn';
import { headingStyles, type HeadingSize } from './heading-styles';

type Props = {
	children: ReactNode;
	align?: 'center' | 'left';
	as?: 'h1' | 'h2';
	bold?: boolean;
	size?: HeadingSize;
};

// No outer margin: the surrounding layout spaces the heading. Line breaks from the CMS are kept.
export const SectionHeading = ({ children, align = 'center', as: Tag = 'h2', bold = false, size = 2 }: Props) => (
	<Tag
		className={cn(
			'text-primary leading-tight whitespace-pre-line [&_strong]:font-bold',
			headingStyles[size],
			align === 'center' && 'text-center',
			bold && 'font-bold',
		)}
	>
		{children}
	</Tag>
);
