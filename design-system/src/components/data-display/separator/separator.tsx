'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';
import { type WithoutClassName } from '../../../without-class-name';

const Separator = ({
	orientation = 'horizontal',
	decorative = true,
	label,
	...props
}: WithoutClassName<React.ComponentProps<typeof SeparatorPrimitive.Root>> & {
	// Horizontal only: text centred on the line, e.g. "or"
	label?: string;
}) => {
	if (label && orientation === 'horizontal') {
		return (
			<div className="flex w-full items-center gap-4">
				<SeparatorPrimitive.Root decorative className="bg-border h-px flex-1" />
				<span className="text-muted-foreground shrink-0 text-sm font-medium">{label}</span>
				<SeparatorPrimitive.Root decorative className="bg-border h-px flex-1" />
			</div>
		);
	}

	return (
		<SeparatorPrimitive.Root
			data-slot="separator"
			decorative={decorative}
			orientation={orientation}
			className="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
			{...props}
		/>
	);
};

export { Separator };
