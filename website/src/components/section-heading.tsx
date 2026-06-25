import { headingStyles, type HeadingSize } from '@/components/heading-styles';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	align?: 'center' | 'left';
	as?: 'h1' | 'h2';
	bold?: boolean;
	size?: HeadingSize;
	className?: string;
};

export const SectionHeading = ({ children, align = 'center', as: Tag = 'h2', bold = false, size = 2, className }: Props) => (
	<Tag
		className={cn(
			'text-primary [&_strong]:font-bold',
			headingStyles[size],
			align === 'center' && 'mb-8 text-center md:mb-10',
			bold && 'font-bold',
			className,
		)}
	>
		{children}
	</Tag>
);
