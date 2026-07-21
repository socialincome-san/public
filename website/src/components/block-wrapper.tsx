import { cn } from '@/lib/utils/cn';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

type Props = ComponentPropsWithoutRef<'div'> & {
	disableMarginTop?: boolean;
	disableMarginBottom?: boolean;
};

export const BlockWrapper = forwardRef<HTMLDivElement, Props>(
	({ children, className, disableMarginTop = false, disableMarginBottom = false, ...rest }, ref) => {
		return (
			<div
				className={cn(
					'storyblok__outline w-site-width max-w-content relative mx-auto px-6',
					disableMarginTop ? 'mt-0' : 'mt-12 md:mt-24 lg:mt-32',
					disableMarginBottom ? 'mb-0' : 'mb-12 md:mb-24 lg:mb-32',
					className,
				)}
				ref={ref}
				{...rest}
			>
				{children}
			</div>
		);
	},
);

BlockWrapper.displayName = 'BlockWrapper';
