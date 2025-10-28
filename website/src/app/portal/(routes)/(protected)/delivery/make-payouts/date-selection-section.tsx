'use client';

import { DatePicker } from '@/app/portal/components/date-picker';

type DateSelectionSectionProps = {
	label: string;
	description: string;
	selected: Date;
	onSelect: (date: Date) => void;
	disabled?: boolean;
};

export function DateSelectionSection({ label, description, selected, onSelect, disabled }: DateSelectionSectionProps) {
	return (
		<div>
			<p className="mb-1 text-sm font-medium">{label}</p>
			<DatePicker selected={selected} onSelect={onSelect} disabled={disabled} />
			<p className="text-muted-foreground mt-1 text-xs">{description}</p>
		</div>
	);
}
