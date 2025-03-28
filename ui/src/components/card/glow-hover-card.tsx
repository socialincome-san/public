'use client';

import React, { LegacyRef } from 'react';

import { cn } from '../../lib/utils';
import { useGlowHover } from '../use-glow-hover';

export const GlowHoverCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
	const refCard = useGlowHover({ lightColor: '#CEFF00' });

	return (
		<div
			ref={refCard as LegacyRef<HTMLDivElement>}
			className={cn('bg-card text-card-foreground rounded-lg border-2', className)}
			{...props}
		/>
	);
};
GlowHoverCard.displayName = 'GlowHoverCard';
