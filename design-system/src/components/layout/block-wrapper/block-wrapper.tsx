import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

type Props = WithoutClassName<ComponentPropsWithoutRef<'div'>> & {
	disableMarginTop?: boolean;
	disableMarginBottom?: boolean;
	spacing?: 'default' | 'compact';
	width?: 'content' | 'bleed';
};

const marginTopClasses = { default: 'mt-12 md:mt-24 lg:mt-32', compact: 'mt-8 md:mt-12 lg:mt-16' };
const marginBottomClasses = { default: 'mb-12 md:mb-24 lg:mb-32', compact: 'mb-8 md:mb-12 lg:mb-16' };

export const BlockWrapper = forwardRef<HTMLDivElement, Props>(
	(
		{ children, disableMarginTop = false, disableMarginBottom = false, spacing = 'default', width = 'content', ...rest },
		ref,
	) => {
		return (
			<div
				className={cn(
					'storyblok__outline w-site-width max-w-content relative mx-auto px-6',
					width === 'bleed' && 'md:w-full md:px-0',
					disableMarginTop ? 'mt-0' : marginTopClasses[spacing],
					disableMarginBottom ? 'mb-0' : marginBottomClasses[spacing],
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
