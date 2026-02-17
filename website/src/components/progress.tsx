'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@socialincome/ui/src/lib/utils';
import * as React from 'react';

type ProgressVariant = 'default' | 'urgent';

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
	value?: number;
	variant?: ProgressVariant;
};

function Progress({ className, value = 0, variant = 'default', ...props }: ProgressProps) {
	const indicatorClass =
		variant === 'urgent'
			? 'bg-rose-400'
			: 'bg-[linear-gradient(to_right,hsl(var(--gradient-button-from)),hsl(var(--gradient-button-to)))]';

	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot="progress-indicator"
				className={cn('h-full transition-all', indicatorClass)}
				style={{ width: `${value}%` }}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
