'use client';

import { Button } from '@/components/button/button';

import { Dialog, DialogContent } from '@/components/dialog';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { useState } from 'react';
import { CampaignSubmissionForm } from './campaign-submission/campaign-submission-form';
import { SubmissionLabels } from './campaign-submission/types';

type Props = {
	label: string;
	labels: SubmissionLabels;
	lang: WebsiteLanguage;
};

export const CreateCampaignButton = ({ label, labels, lang }: Props) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button type="button" className="rounded-full px-5 text-sm font-bold lg:h-11" onClick={() => setOpen(true)}>
				{label}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					variant="large"
					className="flex h-[90dvh] max-h-[90dvh] flex-col overflow-hidden px-0 max-sm:h-dvh max-sm:max-h-dvh"
				>
					<CampaignSubmissionForm labels={labels} lang={lang} />
				</DialogContent>
			</Dialog>
		</>
	);
};
