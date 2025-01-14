'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { BackgroundColor } from '../../interfaces/color';
import { useGlowHover } from '../use-glow-hover';

type BaseContainerProps = {
	backgroundColor?: BackgroundColor;
	wrapperClassName?: string;
	wrapperRef?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>;

export const BaseContainer = React.forwardRef<HTMLDivElement, BaseContainerProps>(
	({ children, className, backgroundColor, wrapperClassName, wrapperRef, ...props }, ref) => {
		return (
			<div className={twMerge(wrapperClassName, backgroundColor)} ref={wrapperRef}>
				<div className="mx-auto max-w-6xl px-3 md:px-6">
					<div className={className} ref={ref} {...props}>
						{children}
					</div>
				</div>
			</div>
		);
	},
);
export const GLowHoverContainer = React.forwardRef<HTMLDivElement, Omit<BaseContainerProps, 'wrapperRef'>>(
	({ className, ...props }, ref) => {
		const refCard = useGlowHover({ lightColor: '#CEFF00' });

		return (
			<BaseContainer
				wrapperClassName={twMerge('theme-blue', className)}
				ref={ref}
				{...props}
				wrapperRef={refCard as React.Ref<HTMLDivElement>}
			/>
		);
	},
);
