'use client';

import { cn } from '@/lib/utils/cn';
import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';
import * as React from 'react';

const Command = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) => {
	return (
		<CommandPrimitive
			data-slot="command"
			className={cn('bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md', className)}
			{...props}
		/>
	);
};

const CommandInput = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) => {
	return (
		<div data-slot="command-input-wrapper" className="flex h-9 items-center gap-2 border-b px-3">
			<SearchIcon className="size-4 shrink-0 opacity-50" />
			<CommandPrimitive.Input
				data-slot="command-input"
				className={cn(
					'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
					className,
				)}
				{...props}
			/>
		</div>
	);
};

const CommandList = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) => {
	return (
		<CommandPrimitive.List
			data-slot="command-list"
			className={cn('max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto', className)}
			{...props}
		/>
	);
};

const CommandEmpty = ({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) => {
	return <CommandPrimitive.Empty data-slot="command-empty" className="py-6 text-center text-sm" {...props} />;
};

const CommandGroup = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) => {
	return (
		<CommandPrimitive.Group
			data-slot="command-group"
			className={cn(
				'text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium',
				className,
			)}
			{...props}
		/>
	);
};

const CommandSeparator = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) => {
	return (
		<CommandPrimitive.Separator data-slot="command-separator" className={cn('bg-border -mx-1 h-px', className)} {...props} />
	);
};

const CommandItem = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) => {
	return (
		<CommandPrimitive.Item
			data-slot="command-item"
			className={cn(
				"data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	);
};

export { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator };
