import React from 'react';
import { twMerge } from 'tailwind-merge';
import { BackgroundColor } from '../../interfaces/color';

type BaseContainerProps = {
	backgroundColor?: BackgroundColor;
} & React.HTMLAttributes<HTMLDivElement>;

export const BaseContainer = React.forwardRef<HTMLDivElement, BaseContainerProps>(
	({ children, className, backgroundColor, ...props }, ref) => {
		return (
			<div className={backgroundColor}>
				<div className="mx-auto max-w-6xl px-3 md:px-6">
					<div className={twMerge(backgroundColor, className)} ref={ref} {...props}>
						{children}
					</div>
				</div>
			</div>
		);
	},
);
