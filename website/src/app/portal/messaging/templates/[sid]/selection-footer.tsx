'use client';

import { Button } from '@/components/button';

type Props = {
	notice?: string;
	selectedCount: number;
	onClear: () => void;
};

export const SelectionFooter = ({ notice, selectedCount, onClear }: Props) => {
	if (notice) {
		return <p className="text-muted-foreground text-sm">{notice}</p>;
	}

	if (selectedCount === 0) {
		return null;
	}

	return (
		<div className="flex items-center justify-between text-sm">
			<span className="text-muted-foreground">{selectedCount} selected</span>
			<Button variant="link" size="sm" onClick={onClear}>
				Clear
			</Button>
		</div>
	);
};
