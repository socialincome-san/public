'use client';

import React from "react";
import {useGlowHover} from "../use-glow-hover";
import {twMerge} from "tailwind-merge";
import {BaseContainer} from "./base-container";

import { BaseContainerProps } from './base-container';

export const GlowHoverContainer = React.forwardRef<HTMLDivElement, Omit<BaseContainerProps, 'wrapperRef'>>(
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