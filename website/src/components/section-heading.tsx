import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	align?: 'center' | 'left';
	as?: 'h1' | 'h2';
	bold?: boolean;
	size?: 'default' | 'large' | 'medium';
	className?: string;
};

export const SectionHeading = ({
	children,
	align = 'center',
	as: Tag = 'h2',
	bold = false,
	size = 'default',
	className,
}: Props) => (
	<Tag
		className={cn(
			'text-primary [&_strong]:font-bold',
			size === 'default' && 'text-4xl md:text-5xl',
			size === 'large' && 'text-3xl leading-[1.2] whitespace-pre-line md:text-4xl xl:text-5xl',
			size === 'medium' && 'text-2xl font-bold md:text-3xl',
			align === 'center' && 'mb-8 text-center md:mb-10',
			bold && 'font-bold',
			className,
		)}
	>
		{children}
	</Tag>
);
