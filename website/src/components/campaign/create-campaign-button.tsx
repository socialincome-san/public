'use client';

import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import type { SubmissionLabels } from './campaign-submission/types';
import { CreateCampaignDialog } from './create-campaign-dialog';

type Props = {
	label: string;
	labels: SubmissionLabels;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CreateCampaignButton = ({ label, labels, lang, currency }: Props) => (
	<CreateCampaignDialog
		labels={labels}
		lang={lang}
		currency={currency}
		trigger={({ openDialog }) => (
			<Button type="button" onClick={openDialog}>
				{label}
			</Button>
		)}
	/>
);
