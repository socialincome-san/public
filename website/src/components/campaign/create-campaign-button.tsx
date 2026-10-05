'use client';

import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/button/button';
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
			<Button type="button" className="rounded-full px-5 text-sm font-bold lg:h-11" onClick={openDialog}>
				{label}
			</Button>
		)}
	/>
);
