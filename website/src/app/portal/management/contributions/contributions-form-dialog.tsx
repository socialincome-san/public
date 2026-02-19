'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { ContributionForm } from './contribution-form';

export const ContributionFormDialog = ({
	open,
	onOpenChange,
	contributionId,
	readOnly,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contributionId?: string;
	readOnly: boolean;
}) => {
	let dialogTitle = 'Add Contribution';
	if (contributionId) {
		dialogTitle = readOnly ? 'View Contribution' : 'Edit Contribution';
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
				</DialogHeader>

				<ContributionForm
					contributionId={contributionId}
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					onError={() => onOpenChange(false)}
					readOnly={readOnly}
				/>
			</DialogContent>
		</Dialog>
	);
};
