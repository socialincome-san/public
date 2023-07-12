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

export type ButtonProps<C extends ElementType> = {
	as?: C;
	color?: ButtonColor;
	size?: ButtonSize;
	// icon?: Icon;
	// iconClassName?: string;
} & ComponentPropsWithoutRef<C>;

export function Button<C extends ElementType = 'button'>({
	as,
	background = 'primary',
	size = 'md',
	color = 'accent',
	// icon,
	// iconClassName,
	children,
	className,
	...props
}: ButtonProps<C>) {
	// const Icon = icon;

	return (
		<button className={classNames('btn', BUTTON_SIZE_MAP[size], BUTTON_COLOR_MAP[color], className)} {...props}>
			{/*{Icon && <Icon className={classNames(BUTTON_ICON_SIZING_MAP[size], iconClassName)} />}*/}
			{children}
		</button>
	);
}
