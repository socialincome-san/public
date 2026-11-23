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
				// 24px tall: the minimum touch target of WCAG 2.5.8
				'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full',
				'border-2 border-transparent bg-origin-border shadow-xs outline-hidden transition-all',
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
					'bg-background pointer-events-none block size-5 rounded-full shadow-sm',
					'transition-transform',
					'data-[state=checked]:translate-x-5',
					'data-[state=unchecked]:translate-x-0',
				)}
			/>
		</SwitchPrimitive.Root>
	);
};

export { Switch };
