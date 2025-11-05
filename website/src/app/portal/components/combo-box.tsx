'use client';

import { Button } from '@/app/portal/components/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/app/portal/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/portal/components/popover';
import { cn } from '@/utils/cn';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

export type ComboboxOption = {
	id: string;
	label: string;
};

export function Combobox({
	options = [],
	value,
	onChange,
	placeholder = 'Select...',
	disabled = false,
}: {
	options?: ComboboxOption[];
	value: string | undefined;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const selected = options.find((o) => o.id === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" className="w-full justify-between" disabled={disabled}>
					{selected ? selected.label : <span className="text-muted-foreground">{placeholder}</span>}
					<ChevronsUpDown className="h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className="bg-popover pointer-events-auto w-[260px] rounded-md border p-0 shadow-md"
				align="start"
			>
				<Command>
					<CommandInput
						placeholder="Search..."
						className="h-9 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					/>
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>

						<CommandGroup>
							{options.map((opt) => (
								<CommandItem
									key={opt.id}
									value={opt.label.toLowerCase()}
									onSelect={() => {
										onChange(opt.id);
										setOpen(false);
									}}
								>
									{opt.label}
									<Check className={cn('ml-auto h-4 w-4', opt.id === value ? 'opacity-100' : 'opacity-0')} />
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
