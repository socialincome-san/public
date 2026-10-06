'use client';

import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { Dialog, DialogContent } from '@socialincome/design-system/overlays/dialog/dialog';
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
				<DialogContent size="full" height="fixed" padding="vertical">
					<CampaignSubmissionForm labels={labels} lang={lang} region={region} />
				</DialogContent>
			</Dialog>
		</>
	);
};
