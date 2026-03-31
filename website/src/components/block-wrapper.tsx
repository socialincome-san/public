import { cn } from '@/lib/utils/cn';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

type Props = ComponentPropsWithoutRef<'div'>;

export const BlockWrapper = forwardRef<HTMLDivElement, Props>(({ children, className, ...rest }, ref) => {
	return (
		<div
			className={cn('storyblok__outline w-site-width max-w-content relative mx-auto my-12 md:my-24 lg:my-32', className)}
			ref={ref}
			{...rest}
		>
			{children}
		</div>
	);
});

BlockWrapper.displayName = 'BlockWrapper';
