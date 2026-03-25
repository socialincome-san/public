import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, PropsWithChildren } from 'react';

export const BlockWrapper = ({ children, className, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => {
	return (
		<div
			className={cn('storyblok__outline w-site-width max-w-content mx-auto my-12 md:my-24 lg:my-32', className)}
			{...rest}
		>
			{children}
		</div>
	);
};
