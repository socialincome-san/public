'use client';

import * as React from 'react';

import { ChevronDownIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export function DatePicker({ selected, onSelect }: { selected?: Date; onSelect: (date: Date) => void }) {
	const [open, setOpen] = React.useState(false);
	const [date, setDate] = React.useState<Date | undefined>(selected);

	useEffect(() => {
		setDate(selected);
	}, [selected]);

	return (
		<div className="flex w-full flex-col gap-3">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" id="date" className="w-full justify-between font-normal">
						{date ? date.toLocaleDateString() : 'Select date'}
						<ChevronDownIcon className="h-4 w-4 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="pointer-events-auto w-72 overflow-hidden p-0" align="start">
					<Calendar
						className="w-72"
						mode="single"
						selected={date}
						captionLayout="dropdown"
						onSelect={(date) => {
							date && onSelect(date);
							setDate(date);
							setOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
