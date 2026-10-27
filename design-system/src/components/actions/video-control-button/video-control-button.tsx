'use client';

import { type ComponentProps, type ReactNode } from 'react';
import { Button } from '../button/button';

type Props = {
	children: ReactNode;
	// `label` fits an icon with text, at the same height as the round icon button
	size?: 'icon' | 'label';
} & Pick<ComponentProps<typeof Button>, 'aria-label' | 'title' | 'onClick' | 'type'>;

export const VideoControlButton = ({ children, size = 'icon', type = 'button', ...props }: Props) => {
	return (
		<Button type={type} variant="overlay" size={size === 'label' ? 'md' : 'icon-lg'} {...props}>
			{children}
		</Button>
	);
};
