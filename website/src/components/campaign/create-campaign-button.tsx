'use client';

import { Button } from '@/components/button';
import { CampaignSubmissionForm, type SubmissionLabels } from '@/components/campaign/campaign-submission-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { useState } from 'react';

type Props = {
	label: string;
	dialogTitle: string;
	labels: SubmissionLabels;
};

export const CreateCampaignButton = ({ label, dialogTitle, labels }: Props) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button type="button" className="rounded-full px-5 text-sm font-bold lg:h-11" onClick={() => setOpen(true)}>
				{label}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					variant="large"
					className="flex h-[90dvh] max-h-[90dvh] flex-col overflow-hidden max-sm:h-dvh max-sm:max-h-dvh"
				>
					<DialogHeader className="shrink-0">
						<DialogTitle>{dialogTitle}</DialogTitle>
					</DialogHeader>
					<CampaignSubmissionForm labels={labels} />
				</DialogContent>
			</Dialog>
		</>
	);
};
