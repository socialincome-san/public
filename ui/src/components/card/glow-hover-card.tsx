'use client';

import React from 'react';

import { cn } from '../../lib/utils';
import { useGlowHover } from '../use-glow-hover';

export const GlowHoverCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }) => {
		const { refCard } = useGlowHover({ lightColor: '#CEFF00' });

		return (
			<div ref={refCard} className={cn('bg-card text-card-foreground rounded-lg border-2', className)} {...props} />
		);
	},
);
GlowHoverCard.displayName = 'GlowHoverCard';
