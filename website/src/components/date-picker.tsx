'use client';

import * as React from 'react';

import { ChevronDownIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export function DatePicker({
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
}) {
	const [open, setOpen] = React.useState(false);
	const [date, setDate] = React.useState<Date | undefined>(selected);
	const formatter = new Intl.DateTimeFormat('de-CH', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});

	// avoid time zone issues by normalizing date to noon
	function normalizeToNoon(date: Date) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
	}

	useEffect(() => {
		if (selected) {
			setDate(normalizeToNoon(selected));
		}
	}, [selected]);

	return (
		<div className="flex w-full flex-col gap-3">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						disabled={disabled}
						variant="outline"
						id="date"
						className="w-full justify-between font-normal"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								setOpen((prev) => !prev);
							}
						}}
					>
						{date ? formatter.format(date) : placeholder}
						<ChevronDownIcon className="h-4 w-4 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="pointer-events-auto w-72 overflow-hidden p-0" align="start">
					<Calendar
						className="w-72"
						mode="single"
						selected={date}
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
							setDate(normalized);
							setOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
