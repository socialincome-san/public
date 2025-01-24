import React from 'react';
import { twMerge } from 'tailwind-merge';

export type BaseContainerProps = {
	wrapperClassName?: string;
	wrapperRef?: React.Ref<HTMLDivElement>;
    baseClassNames?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const BaseContainer = React.forwardRef<HTMLDivElement, BaseContainerProps>(
	({ children, className, baseClassNames, wrapperClassName, wrapperRef, ...props }, ref) => {
		return (
			<div className={twMerge(wrapperClassName, baseClassNames)} ref={wrapperRef}>
				<div className="mx-auto max-w-6xl px-3 md:px-6">
					<div className={className} ref={ref} {...props}>
						{children}
					</div>
				</div>
			</div>
		);
	},
);
