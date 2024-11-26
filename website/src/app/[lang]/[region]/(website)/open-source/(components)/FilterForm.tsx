'use client';

import { useState } from 'react';

interface FilterFormProps {
	labels: string[];
	handleLabel: (label: string) => void;
	filterText: string;
}

export function FilterForm({ labels, handleLabel, filterText }: FilterFormProps) {
	const [selectedLabel, setSelectedLabel] = useState('');

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;

		// Reset to show all issues if `filterText` is selected
		if (value === filterText) {
			setSelectedLabel(''); // Reset the local state
			handleLabel(''); // Notify parent to show all issues
		} else {
			setSelectedLabel(value);
			handleLabel(value); // Notify parent with selected label
		}
	};

	return (
		<section className="filter-form mb-8">
			<select
				value={selectedLabel}
				onChange={handleChange}
				aria-label="Filter issues by label"
				className="border-foreground bg-background border px-4 py-3 pr-10 focus:border-blue-500 focus:outline-none"
			>
				<option value={filterText}>{filterText}</option>
				{labels.map((label) => (
					<option key={label} value={label}>
						{label}
					</option>
				))}
			</select>
		</section>
	);
}
