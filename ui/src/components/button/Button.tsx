import classNames from 'classnames';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export const SO_BUTTON_VARIANTS = ['primary', 'secondary', 'tertiary', 'outlined'] as const;
export const SO_BUTTON_SIZES = ['base', 'xl'];

export interface SoButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
	variant?: (typeof SO_BUTTON_VARIANTS)[number];
	size?: (typeof SO_BUTTON_SIZES)[number];
	href?: string;
}

/**
 * Primary UI component for user interaction
 */
export const SoButton = ({
	children,
	type = 'button',
	className = '',
	variant = 'primary',
	size = 'default',
	href,
	...props
}: SoButtonProps) => {
	const defaultClassNames = ['so-c-button', `so-c-button--${variant}`, `so-c-button--${size}`];

	className = classNames(defaultClassNames, className);

	if (href) {
		<a href={href} className={className} {...props}>
			{children}
		</a>;
	}

	return (
		<button type={type} className={className} {...props}>
			{children}
		</button>
	);
};
