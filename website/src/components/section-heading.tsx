import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	align?: 'center' | 'left';
	as?: 'h1' | 'h2';
	bold?: boolean;
	className?: string;
};

export const SectionHeading = ({ children, align = 'center', as: Tag = 'h2', bold = false, className }: Props) => (
	<Tag
		className={cn(
			'text-primary text-4xl md:text-5xl [&_strong]:font-bold',
			align === 'center' && 'mb-8 text-center md:mb-10',
			bold && 'font-bold',
			className,
		)}
	>
		{children}
	</Tag>
);
