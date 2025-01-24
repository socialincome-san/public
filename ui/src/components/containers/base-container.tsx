import React from 'react';
import { twMerge } from 'tailwind-merge';
import { BackgroundColor } from '../../interfaces/color';

type BaseContainerProps = {
	backgroundColor?: BackgroundColor;
	wrapperClassName?: string;
	wrapperRef?: React.Ref<HTMLDivElement>;
    baseClassNames?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const BaseContainer = React.forwardRef<HTMLDivElement, BaseContainerProps>(
	({ children, className, baseClassNames, backgroundColor, wrapperClassName, wrapperRef, ...props }, ref) => {
		return (
			<div className={twMerge(wrapperClassName, backgroundColor, baseClassNames)} ref={wrapperRef}>
				<div className="mx-auto max-w-6xl px-3 md:px-6">
					<div className={className} ref={ref} {...props}>
						{children}
					</div>
				</div>
			</div>
		);
	},
);
