'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';
import { cn } from '../lib/utils';

const Progress = React.forwardRef<
	React.ElementRef<typeof ProgressPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
	<ProgressPrimitive.Root
		ref={ref}
		className={cn('relative h-full w-full overflow-hidden rounded-full bg-primary p-1', className)}
		{...props}
	>
		<div className="relative h-full w-full">
			<ProgressPrimitive.Indicator
				className="bg-accent h-full absolute left-0 top-0 bottom-0 rounded-s-full transition-all"
				style={{
					width: `calc(${value || 0}%)`,
					transform: 'translateX(0.1rem)'
				}}
			/>
		</div>
	</ProgressPrimitive.Root>

));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
