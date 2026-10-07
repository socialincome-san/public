import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { type WithoutClassName } from '../../../without-class-name';

const blockWrapperVariants = cva('storyblok__outline w-site-width max-w-content relative mx-auto px-6', {
	variants: {
		marginTop: {
			none: 'mt-0',
			sm: 'mt-2 md:mt-4 lg:mt-6',
			md: 'mt-4 md:mt-8 lg:mt-12',
			lg: 'mt-6 md:mt-12 lg:mt-16',
			xl: 'mt-12 md:mt-24 lg:mt-32',
		},
		marginBottom: {
			none: 'mb-0',
			sm: 'mb-2 md:mb-4 lg:mb-6',
			md: 'mb-4 md:mb-8 lg:mb-12',
			lg: 'mb-6 md:mb-12 lg:mb-16',
			xl: 'mb-12 md:mb-24 lg:mb-32',
		},
		width: {
			content: '',
			bleed: 'md:w-full md:px-0',
		},
	},
	defaultVariants: {
		marginTop: 'xl',
		marginBottom: 'xl',
		width: 'content',
	},
});

type Props = WithoutClassName<ComponentPropsWithoutRef<'div'>> & VariantProps<typeof blockWrapperVariants>;

export const BlockWrapper = forwardRef<HTMLDivElement, Props>(
	({ children, marginTop, marginBottom, width, ...rest }, ref) => {
		return (
			<div className={blockWrapperVariants({ marginTop, marginBottom, width })} ref={ref} {...rest}>
				{children}
			</div>
		);
	},
);

BlockWrapper.displayName = 'BlockWrapper';
