'use client';

import React from "react";
import {useGlowHover} from "../use-glow-hover";
import {twMerge} from "tailwind-merge";
import {BaseContainer} from "./base-container";
import {BackgroundColor} from "../../interfaces/color";

type BaseContainerProps = {
    backgroundColor?: BackgroundColor;
    wrapperClassName?: string;
    wrapperRef?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>;

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