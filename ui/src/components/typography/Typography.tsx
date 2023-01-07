import classNames from 'classnames';

export const SO_TYPOGRAPHY_SIZES = [
	'xs',
	'sm',
	'base',
	'lg',
	'xl',
	'2xl',
	'3xl',
	'4xl',
	'5xl',
	'6xl',
	'7xl',
	'8xl',
	'9xl',
] as const;

export type SoTypographySize = (typeof SO_TYPOGRAPHY_SIZES)[number];

export interface SoTypographyProps extends React.PropsWithChildren, React.HTMLAttributes<any> {
	/**
	 * The DOM element type e.g. h1, h2, h3,..., p
	 */
	element?: keyof Pick<JSX.IntrinsicElements, 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span'>;

	/**
	 * The text size from the predefined stack
	 */
	size?: SoTypographySize;
}

/**
 * Component to apply different text styles
 */
export const SoTypography = ({ element = 'p', size = 'base', className, children, ...props }: SoTypographyProps) => {
	const DOMelement = element;

	return (
		<DOMelement className={classNames(className, `text-${size}`)} {...props}>
			{children}
		</DOMelement>
	);
};
