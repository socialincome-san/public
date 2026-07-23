'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { useState } from 'react';

type Props = {
	label: string;
	comingSoonLabel: string;
};

export const CreateCampaignButton = ({ label, comingSoonLabel }: Props) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button type="button" className="rounded-full px-5 text-sm font-bold lg:h-11" onClick={() => setOpen(true)}>
				{label}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogTitle>{comingSoonLabel}</DialogTitle>
				</DialogContent>
			</Dialog>
		</>
	);
};
