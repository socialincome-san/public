'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

const Switch = (props: WithoutClassName<React.ComponentProps<typeof SwitchPrimitive.Root>>) => {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				'relative inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full',
				'border border-transparent bg-origin-border shadow-xs outline-hidden transition-all',
				'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'bg-input',
				'data-[state=checked]:bg-[linear-gradient(to_right,hsl(var(--gradient-button-from)),hsl(var(--gradient-button-to)))]',
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					'bg-background pointer-events-none block size-4 rounded-full shadow-sm',
					'transition-transform',
					'data-[state=checked]:translate-x-[calc(100%-2px)]',
					'data-[state=unchecked]:translate-x-0',
				)}
			/>
		</SwitchPrimitive.Root>
	);
};

export { Switch };
