import * as React from 'react';
import { ComponentPropsWithoutRef, ElementType } from 'react';
import classNames from 'classnames';
import { Color } from '../../interfaces/color';
import { Size } from '../../interfaces/size';

type ButtonSize = Extract<Size, 'xs' | 'sm' | 'md' | 'lg'>;
const BUTTON_SIZE_MAP: { [key in ButtonSize]: string } = {
	xs: 'btn-xs',
	sm: 'btn-sm',
	md: '',
	lg: 'btn-lg',
};

type ButtonColor = Extract<Color, 'primary' | 'secondary' | 'accent'>;
const BUTTON_COLOR_MAP: { [key in ButtonColor]: string } = {
	primary: 'btn-primary',
	secondary: 'btn-secondary',
	accent: 'btn-accent',
};

type ButtonVariant = 'solid' | 'outline' | 'ghost';
const BUTTON_VARIANT_MAP: { [key in ButtonVariant]: string } = {
	solid: 'btn-solid',
	outline: 'btn-outline',
	ghost: 'btn-ghost',
};

type ButtonShape = 'regular' | 'wide' | 'block' | 'circle' | 'square';
const BUTTON_SHAPE_MAP: { [key in ButtonShape]: string } = {
	regular: '',
	wide: 'btn-wide',
	block: 'btn-block',
	circle: 'btn-circle',
	square: 'btn-square',
};

export type ButtonProps<C extends ElementType> = {
	as?: C;
	color?: ButtonColor;
	size?: ButtonSize;
	variant?: ButtonVariant;
	shape?: ButtonShape;
	// icon?: Icon;
	// iconClassName?: string;
} & ComponentPropsWithoutRef<C>;

export function Button<C extends ElementType = 'button'>({
	as,
	background = 'primary',
	size = 'md',
	color = 'accent',
	variant = 'solid',
	shape = 'regular',
	// icon,
	// iconClassName,
	children,
	className,
	...props
}: ButtonProps<C>) {
	// const Icon = icon;

	return (
		<button
			className={classNames(
				'btn',
				BUTTON_SIZE_MAP[size],
				BUTTON_COLOR_MAP[color],
				BUTTON_VARIANT_MAP[variant],
				BUTTON_SHAPE_MAP[shape],
				className,
			)}
			{...props}
		>
			{/*{Icon && <Icon className={classNames(BUTTON_ICON_SIZING_MAP[size], iconClassName)} />}*/}
			{children}
		</button>
	);
}
