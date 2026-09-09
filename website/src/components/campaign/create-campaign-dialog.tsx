'use client';

import { Dialog, DialogContent } from '@/components/dialog';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { type ReactNode, useState } from 'react';
import { CampaignSubmissionForm } from './campaign-submission/campaign-submission-form';
import type { SubmissionLabels } from './campaign-submission/types';

type TriggerProps = {
	openDialog: () => void;
};

type Props = {
	labels: SubmissionLabels;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	trigger: (props: TriggerProps) => ReactNode;
};

export const CreateCampaignDialog = ({ labels, lang, region, trigger }: Props) => {
	const [open, setOpen] = useState(false);
	const openDialog = () => setOpen(true);

	return (
		<>
			{trigger({ openDialog })}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					variant="large"
					className="flex h-[90dvh] max-h-[90dvh] flex-col overflow-hidden px-0 max-sm:h-dvh max-sm:max-h-dvh"
				>
					<CampaignSubmissionForm labels={labels} lang={lang} region={region} />
				</DialogContent>
			</Dialog>
		</>
	);
};
