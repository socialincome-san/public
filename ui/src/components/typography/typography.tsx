import classNames from 'classnames';
import { ComponentPropsWithoutRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Color } from '../../interfaces/color';
import { Size } from '../../interfaces/size';
import IntrinsicElements = React.JSX.IntrinsicElements;

export type FontSize = Extract<Size, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'>;
const FONT_SIZE_MAP: { [key in FontSize]: string } = {
	'5xl': 'text-5xl lg:text-6xl lg:tracking-tight xl:text-7xl',
	'4xl': 'text-4xl lg:text-4xl lg:tracking-tight xl:text-5xl',
	'3xl': 'text-3xl lg:text-3xl lg:tracking-tight',
	'2xl': 'text-2xl tracking-tight',
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

type FontColor = Extract<
	Color,
	| 'primary'
	| 'primary-focus'
	| 'secondary'
	| 'secondary-focus'
	| 'accent'
	| 'accent-focus'
	| 'neutral'
	| 'neutral-focus'
	| 'info'
	| 'success'
	| 'warning'
	| 'error'
>;
const FONT_COLOR_MAP: { [key in FontColor]: string } = {
	primary: 'text-primary',
	'primary-focus': 'text-primary-focus',
	secondary: 'text-secondary',
	'secondary-focus': 'text-secondary-focus',
	accent: 'text-accent',
	'accent-focus': 'text-accent-focus',
	neutral: 'text-neutral',
	'neutral-focus': 'text-neutral-focus',
	info: 'text-info',
	success: 'text-success',
	warning: 'text-warning',
	error: 'text-error',
};

const LINE_HEIGHTS = ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'] as const;
export type LineHeight = (typeof LINE_HEIGHTS)[number];
const LINE_HEIGHT_MAP: { [key in LineHeight]: string } = {
	none: 'xs:leading-none sm:leading-none md:leading-none lg:leading-none xl:leading-none',
	tight: 'xs:leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-tight',
	snug: 'xs:leading-snug sm:leading-snug md:leading-snug lg:leading-snug xl:leading-snug',
	normal: 'xs:leading-normal sm:leading-normal md:leading-normal lg:leading-normal xl:leading-normal',
	relaxed: 'xs:leading-relaxed sm:leading-relaxed md:leading-relaxed lg:leading-relaxed xl:leading-relaxed',
	loose: 'xs:leading-loose sm:leading-loose md:leading-loose lg:leading-loose xl:leading-loose',
};

type ElementType = keyof Pick<IntrinsicElements, 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span'>;

type TypographyProps<C extends ElementType> = {
	as?: C;
	size?: FontSize;
	weight?: FontWeight;
	color?: FontColor;
	lineHeight?: LineHeight;
} & ComponentPropsWithoutRef<C>;

export function Typography<C extends ElementType = 'p'>({
	as,
	size = 'md',
	weight = 'normal',
	color = 'neutral',
	lineHeight = 'normal',
	className,
	children,
	...props
}: TypographyProps<C>) {
	const Component = as || 'p';
	return (
		<Component
			className={twMerge(
				classNames(
					FONT_SIZE_MAP[size],
					FONT_WEIGHT_MAP[weight],
					FONT_COLOR_MAP[color],
					LINE_HEIGHT_MAP[lineHeight],
					className,
				),
			)}
			{...props}
		>
			{children}
		</Component>
	);
}
