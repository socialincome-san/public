'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';
import { type WithoutClassName } from '../../../without-class-name';

type SeparatorProps = WithoutClassName<React.ComponentProps<typeof SeparatorPrimitive.Root>> & {
	// Horizontal only: text centred on the line, such as "or"
	label?: string;
};

const Separator = ({ orientation = 'horizontal', decorative = true, label, ...props }: SeparatorProps) => {
	if (label && orientation === 'horizontal') {
		return (
			<SeparatorPrimitive.Root
				data-slot="separator"
				decorative={decorative}
				orientation={orientation}
				className="flex w-full items-center gap-4"
				{...props}
			>
				<span aria-hidden className="bg-border h-px flex-1" />
				<span className="text-muted-foreground shrink-0 text-sm font-medium">{label}</span>
				<span aria-hidden className="bg-border h-px flex-1" />
			</SeparatorPrimitive.Root>
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
