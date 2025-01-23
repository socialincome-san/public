import React from 'react';
import { twMerge } from 'tailwind-merge';
import { BackgroundColor } from '../../interfaces/color';

type BaseContainerProps = {
	baseClassNames?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const BaseContainer = React.forwardRef<HTMLDivElement, BaseContainerProps>(
	({ children, className, baseClassNames, ...props }, ref) => {
		return (
			<div className={baseClassNames}>
				<div className="mx-auto max-w-6xl px-3 md:px-6">
					<div className={twMerge(baseClassNames, className)} ref={ref} {...props}>
						{children}
					</div>
				</div>
			</div>
		);
	},
);
