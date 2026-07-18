'use client';

import { Alert, AlertDescription } from '@/components/alert';
import { Button } from '@/components/button';

type Props = {
	variant: 'offer' | 'active';
	totalCount: number;
	pageRowCount: number;
	onSelectAllMatching?: () => void;
	onClear: () => void;
};

export const SelectAllMatchingBanner = ({ variant, totalCount, pageRowCount, onSelectAllMatching, onClear }: Props) => {
	if (variant === 'offer') {
		return (
			<Alert>
				<AlertDescription className="flex items-center justify-between gap-4">
					<span>All {pageRowCount} on this page selected.</span>
					<Button variant="link" size="sm" onClick={onSelectAllMatching}>
						Select all {totalCount} matching
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Alert>
			<AlertDescription className="flex items-center justify-between gap-4">
				<span>All {totalCount} matching rows selected.</span>
				<Button variant="link" size="sm" onClick={onClear}>
					Clear selection
				</Button>
			</AlertDescription>
		</Alert>
	);
};
