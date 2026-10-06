'use client';

import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import type { SubmissionLabels } from './campaign-submission/types';
import { CreateCampaignDialog } from './create-campaign-dialog';

type Props = {
	label: string;
	labels: SubmissionLabels;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CreateCampaignButton = ({ label, labels, lang, region }: Props) => (
	<CreateCampaignDialog
		labels={labels}
		lang={lang}
		region={region}
		trigger={({ openDialog }) => (
			<Button type="button" onClick={openDialog}>
				{label}
			</Button>
		)}
	/>
);
