'use client';

import { Button } from '@/app/portal/components/button';
import { Calendar } from '@/app/portal/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/portal/components/popover';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

type DatePickerProps = {
	fieldId?: string;
	initialDate?: Date;
};

export function DatePicker({ fieldId, initialDate }: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [selectedDate, setDate] = React.useState<Date | undefined>(initialDate);

	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					id={fieldId}
					className={`justify-between font-normal ${selectedDate ? 'text-primary' : 'text-muted-foreground'}`}
				>
					{selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
					<ChevronDownIcon className="h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto overflow-hidden p-0" align="start">
				<Calendar
					mode="single"
					selected={selectedDate}
					captionLayout="dropdown"
					onSelect={(newDate) => {
						setDate(newDate);
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
