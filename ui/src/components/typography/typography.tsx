import classNames from 'classnames';
import React, { ComponentPropsWithoutRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { FontColor } from '../../interfaces/color';
import { Size } from '../../interfaces/size';

export type FontSize = Extract<Size, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'>;
const FONT_SIZE_MAP: { [key in FontSize]: string } = {
	'6xl': 'text-6xl md:text-7xl',
	'5xl': 'text-4xl md:text-5xl',
	'4xl': 'text-3xl md:text-4xl',
	'3xl': 'text-2xl md:text-3xl',
	'2xl': 'text-xl md:text-2xl',
	xl: 'text-xl',
	lg: 'text-lg',
	md: 'text-base',
	sm: 'text-sm',
	xs: 'text-xs',
};

const FONT_WEIGHTS = ['normal', 'medium', 'bold'] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];
const FONT_WEIGHT_MAP: { [key in FontWeight]: string } = {
	normal: 'font-normal',
	medium: 'font-medium',
	bold: 'font-bold',
};

const FONT_COLOR_MAP: { [key in FontColor]: string } = {
	background: 'text-background',
	foreground: 'text-foreground',
	primary: 'text-primary',
	'primary-foreground': 'text-primary-foreground',
	secondary: 'text-secondary',
	'secondary-foreground': 'text-secondary-foreground',
	accent: 'text-accent',
	'accent-foreground': 'text-accent-foreground',
	destructive: 'text-destructive',
	'destructive-foreground': 'text-destructive-foreground',
	muted: 'text-muted',
	'muted-foreground': 'text-muted-foreground',
	card: 'text-card',
	'card-foreground': 'text-card-foreground',
	popover: 'text-popover',
	'popover-foreground': 'text-popover-foreground',
};

const LINE_HEIGHTS = ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'] as const;
export type LineHeight = (typeof LINE_HEIGHTS)[number];
const LINE_HEIGHT_MAP: { [key in LineHeight]: string } = {
	none: 'leading-none md:leading-none',
	tight: 'leading-tight md:leading-tight',
	snug: 'leading-snug md:leading-snug',
	normal: 'leading-normal md:leading-normal',
	relaxed: 'leading-relaxed md:leading-relaxed',
	loose: 'leading-loose md:leading-loose',
};

export type TypographyProps<C extends React.ElementType> = {
	as?: C;
	size?: FontSize;
	weight?: FontWeight;
	color?: FontColor;
	lineHeight?: LineHeight;
	children?: React.ReactNode;
} & ComponentPropsWithoutRef<C>;

export function Typography<C extends React.ElementType = 'p'>({
	as,
	size,
	weight,
	color,
	lineHeight,
	className,
	children,
	...props
}: TypographyProps<C>) {
	const Component = as || 'p';
	return (
		<Component
			className={twMerge(
				classNames(
					size && FONT_SIZE_MAP[size],
					weight && FONT_WEIGHT_MAP[weight],
					color && FONT_COLOR_MAP[color],
					lineHeight && LINE_HEIGHT_MAP[lineHeight],
					className,
				),
			)}
			{...props}
		>
			{children}
		</Component>
	);
}
