'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../cn';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../overlays/command/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../overlays/popover/popover';
import { selectTriggerVariants } from '../select/select';

type ComboboxOption = {
	id: string;
	label: string;
};

export const Combobox = ({
	options = [],
	value,
	onChange,
	placeholder = 'Select...',
	searchPlaceholder = 'Search...',
	emptyLabel = 'No results found.',
	ariaLabel,
	disabled = false,
}: {
	options?: ComboboxOption[];
	value: string | undefined;
	onChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyLabel?: string;
	ariaLabel?: string;
	disabled?: boolean;
}) => {
	const [open, setOpen] = useState(false);
	const selected = options.find((o) => o.id === value);

	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger asChild>
				<button
					type="button"
					role="combobox"
					aria-expanded={open}
					aria-label={ariaLabel}
					className={selectTriggerVariants()}
					data-placeholder={selected ? undefined : ''}
					disabled={disabled}
				>
					{selected ? selected.label : placeholder}
					<ChevronsUpDown className="h-4 w-4 opacity-50" />
				</button>
			</PopoverTrigger>

			<PopoverContent variant="picker" align="start">
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyLabel}</CommandEmpty>

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
};
