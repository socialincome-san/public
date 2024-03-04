'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';
import { FC, useContext, useState } from 'react';
import { cn } from '../lib/utils';

const PopoverOnOpenChangeContext = React.createContext({
	onOpenChange: (_open: boolean) => {},
	timeoutId: { current: null } as React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
	openDelay: 0,
	closeDelay: 200,
});

const Popover: FC<React.ComponentProps<typeof PopoverPrimitive.Root> & { openDelay?: number; closeDelay?: number }> = ({
	open,
	onOpenChange,
	openDelay = 0,
	closeDelay = 200,
	...props
}) => {
	const [defaultOpen, defaultOnOpenChange] = useState(false);
	const timeoutId = React.useRef(null);

	return (
		<PopoverOnOpenChangeContext.Provider
			value={{
				onOpenChange: onOpenChange ?? defaultOnOpenChange,
				timeoutId,
				openDelay,
				closeDelay,
			}}
		>
			<PopoverPrimitive.Root {...props} open={open ?? defaultOpen} onOpenChange={onOpenChange ?? defaultOnOpenChange} />
		</PopoverOnOpenChangeContext.Provider>
	);
};

const PopoverTrigger: React.FC<any> = (props) => {
	const { onOpenChange, timeoutId, openDelay, closeDelay } = useContext(PopoverOnOpenChangeContext);

	return (
		<PopoverPrimitive.Trigger
			{...props}
			onMouseEnter={() => {
				timeoutId.current && clearTimeout(timeoutId.current);
				setTimeout(() => onOpenChange(true), openDelay);
			}}
			onMouseLeave={() => {
				timeoutId.current = setTimeout(() => onOpenChange(false), closeDelay);
			}}
		/>
	);
};

const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.PropsWithoutRef<React.ComponentProps<typeof PopoverPrimitive.Content>>
>(({ align = 'center', sideOffset = 4, className, ...props }, ref) => {
	const { onOpenChange, timeoutId } = useContext(PopoverOnOpenChangeContext);

	return (
		<PopoverPrimitive.Portal forceMount>
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				sideOffset={sideOffset}
				onMouseEnter={() => {
					timeoutId.current && clearTimeout(timeoutId.current);
				}}
				onMouseLeave={() => {
					timeoutId.current = setTimeout(() => onOpenChange(false), 300);
				}}
				className={cn(
					'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-none data-[state=open]:visible data-[state=closed]:invisible data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
					className,
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverContent, PopoverTrigger };
