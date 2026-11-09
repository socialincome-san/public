'use client';

import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import type { ComponentProps } from 'react';
import type { SubmissionLabels } from './campaign-submission/types';
import { CreateCampaignDialog } from './create-campaign-dialog';

type Props = {
	label: string;
	labels: SubmissionLabels;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
} & Pick<ComponentProps<typeof Button>, 'variant'>;

export const CreateCampaignButton = ({ label, labels, lang, currency, variant }: Props) => (
	<CreateCampaignDialog
		labels={labels}
		lang={lang}
		currency={currency}
		trigger={({ openDialog }) => (
			<Button type="button" variant={variant} onClick={openDialog}>
				{label}
			</Button>
		)}
	/>
);
