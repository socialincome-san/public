'use client';

import { type ComponentProps, type ReactNode } from 'react';
import { Button } from '../button/button';

type Props = {
	children: ReactNode;
} & Pick<ComponentProps<typeof Button>, 'aria-label' | 'title' | 'onClick' | 'type'>;

export const VideoControlButton = ({ children, type = 'button', ...props }: Props) => {
	return (
		<Button type={type} variant="overlay" size="icon-lg" {...props}>
			{children}
		</Button>
	);
};
