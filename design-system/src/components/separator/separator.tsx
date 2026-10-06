'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';
import { type WithoutClassName } from '../../without-class-name';

const Separator = ({
	orientation = 'horizontal',
	decorative = true,
	...props
}: WithoutClassName<React.ComponentProps<typeof SeparatorPrimitive.Root>>) => {
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
