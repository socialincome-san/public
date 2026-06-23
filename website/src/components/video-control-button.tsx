'use client';

import { Button } from '@/components/button';
import { cn } from '@/lib/utils/cn';
import { type ComponentProps, type ReactNode } from 'react';

type Props = {
	children: ReactNode;
	className?: string;
} & Pick<ComponentProps<typeof Button>, 'aria-label' | 'title' | 'onClick' | 'type'>;

export const VideoControlButton = ({ children, className, type = 'button', ...props }: Props) => {
	return (
		<Button
			type={type}
			variant="secondary"
			size="icon"
			className={cn('text-primary-foreground bg-foreground/45 hover:bg-foreground/60 size-10 rounded-full', className)}
			{...props}
		>
			{children}
		</Button>
	);
};
