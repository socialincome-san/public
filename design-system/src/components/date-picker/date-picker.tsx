'use client';

import * as React from 'react';

import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from '../calendar/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';
import { selectTriggerVariants } from '../select/select';

// avoid time zone issues by normalizing date to noon
export const normalizeToNoon = (date: Date) => {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
};

export const DatePicker = ({
	selected,
	onSelect,
	disabled,
	startMonth,
	endMonth,
	placeholder = 'Select date',
}: {
	selected?: Date;
	startMonth?: Date;
	endMonth?: Date;
	onSelect: (date: Date) => void;
	disabled?: boolean;
	placeholder?: string;
}) => {
	const [open, setOpen] = React.useState(false);
	const formatter = new Intl.DateTimeFormat('de-CH', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});

	const date = selected ? normalizeToNoon(selected) : undefined;

	return (
		<div className="flex w-full flex-col gap-3">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						data-testid="date-picker-button"
						disabled={disabled}
						id="date"
						className={selectTriggerVariants()}
						data-placeholder={date ? undefined : ''}
					>
						{date ? formatter.format(date) : placeholder}
						<ChevronDownIcon className="h-4 w-4 opacity-50" />
					</button>
				</PopoverTrigger>
				<PopoverContent variant="picker" align="start">
					<Calendar
						mode="single"
						selected={date}
						defaultMonth={date}
						captionLayout="dropdown"
						startMonth={startMonth}
						endMonth={endMonth}
						disabled={disabled}
						onSelect={(date) => {
							if (!date) {
								return;
							}
							const normalized = normalizeToNoon(date);
							onSelect(normalized);
							setOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};
