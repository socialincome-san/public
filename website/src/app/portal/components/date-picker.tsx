'use client';

import { Button } from '@/app/portal/components/button';
import { Calendar } from '@/app/portal/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/portal/components/popover';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

type DatePickerProps = {
	fieldId?: string;
	value?: Date;
	onChange?: (date: Date | undefined) => void;
	readOnly?: boolean;
};

export function DatePicker({ fieldId, value, onChange, readOnly }: DatePickerProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					id={fieldId}
					disabled={readOnly}
					className={`justify-between font-normal ${value ? 'text-primary' : 'text-muted-foreground'}`}
				>
					{value ? value.toLocaleDateString() : 'Select date'}
					<ChevronDownIcon className="h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto overflow-hidden p-0" align="start">
				<Calendar
					mode="single"
					selected={value}
					captionLayout="dropdown"
					onSelect={(newDate) => {
						onChange?.(newDate);
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
