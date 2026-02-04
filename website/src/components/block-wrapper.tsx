import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, PropsWithChildren } from 'react';

export const BlockWrapper = ({ children, className, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => {
	return (
		<div className={cn('storyblok__outline my-8 lg:my-16', className)} {...rest}>
			{children}
		</div>
	);
};
