'use client';

import { Button } from '@/components/button';
import { cn } from '@socialincome/ui';
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
			className={cn('size-10 rounded-full bg-black/45 text-white hover:bg-black/60', className)}
			{...props}
		>
			{children}
		</Button>
	);
};
