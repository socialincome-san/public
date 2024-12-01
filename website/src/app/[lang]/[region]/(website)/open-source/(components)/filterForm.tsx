'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@socialincome/ui';
import { useState } from 'react';

interface FilterFormProps {
	labels: string[];
	handleLabel: (label: string) => void;
	filterText: string;
}

export function FilterForm({ labels, handleLabel, filterText }: FilterFormProps) {
	const [selectedLabel, setSelectedLabel] = useState('');

	const handleChange = (value: string) => {
		if (value === filterText) {
			setSelectedLabel('');
			handleLabel('');
		} else {
			setSelectedLabel(value);
			handleLabel(value);
		}
	};

	return (
		<section className="mb-8 max-w-44">
			<Select value={selectedLabel} onValueChange={handleChange}>
				<SelectTrigger aria-label="Filter issues by label">
					<SelectValue placeholder={filterText} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={filterText}>{filterText}</SelectItem>
					{labels.map((label) => (
						<SelectItem key={label} value={label}>
							{label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</section>
	);
}
