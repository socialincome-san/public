'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { ThankYouPanel } from '@socialincome/design-system/feedback/thank-you-panel/thank-you-panel';
import { DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { useTranslations } from 'next-intl';
import { CampaignSubmissionFormCard, CampaignSubmissionFormCardColumn } from './form-layout';
import type { SubmissionLabels } from './types';

const SUPPORT_EMAIL = 'support@socialincome.org';

type Props = {
	labels: Pick<
		SubmissionLabels,
		| 'successCreatedTitle'
		| 'successThankYou'
		| 'successLiveTitle'
		| 'successDidntGetIt'
		| 'successRetry'
		| 'successRetrySending'
		| 'successSupportPrefix'
	>;
	email: string;
	isRetrying: boolean;
	onRetry: () => void;
};

export const CampaignSubmissionGuestSuccess = ({ labels, email, isRetrying, onRetry }: Props) => {
	const t = useTranslations('website-common');

	return (
		<div className="flex min-h-0 flex-1 flex-col" data-testid="campaign-submission-guest-success">
			<DialogHeader>
				<DialogTitle>{labels.successCreatedTitle}</DialogTitle>
			</DialogHeader>

			<CampaignSubmissionFormCardColumn>
				<CampaignSubmissionFormCard surface="gradient">
					<ThankYouPanel
						padding="compact"
						message={labels.successThankYou}
						title={labels.successLiveTitle}
						description={t.rich('campaigns-page.submission.success-guest-description', {
							email,
							strong: (chunks) => <span className="font-medium">{chunks}</span>,
						})}
						actionHint={labels.successDidntGetIt}
						action={
							<Button type="button" disabled={isRetrying} onClick={onRetry}>
								{isRetrying ? labels.successRetrySending : labels.successRetry}
							</Button>
						}
						support={{ prefix: labels.successSupportPrefix, email: SUPPORT_EMAIL }}
					/>
				</CampaignSubmissionFormCard>
			</CampaignSubmissionFormCardColumn>
		</div>
	);
};
