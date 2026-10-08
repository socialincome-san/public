'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { ThankYouPanel } from '@socialincome/design-system/feedback/thank-you-panel/thank-you-panel';
import { DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import type { ReactNode } from 'react';
import { CampaignSubmissionFormCard, CampaignSubmissionFormCardColumn } from './form-layout';
import type { SubmissionLabels } from './types';

const SUPPORT_EMAIL = 'support@socialincome.org';
const EMAIL_PLACEHOLDER = '{email}';

type Props = {
	labels: Pick<
		SubmissionLabels,
		| 'successCreatedTitle'
		| 'successThankYou'
		| 'successLiveTitle'
		| 'successGuestDescription'
		| 'successDidntGetIt'
		| 'successRetry'
		| 'successRetrySending'
		| 'successSupportPrefix'
	>;
	email: string;
	isRetrying: boolean;
	onRetry: () => void;
};

const renderGuestDescription = (template: string, email: string): ReactNode => {
	const index = template.indexOf(EMAIL_PLACEHOLDER);
	if (index === -1) {
		return template;
	}

	return (
		<>
			{template.slice(0, index)}
			<span className="font-medium">{email}</span>
			{template.slice(index + EMAIL_PLACEHOLDER.length)}
		</>
	);
};

export const CampaignSubmissionGuestSuccess = ({ labels, email, isRetrying, onRetry }: Props) => (
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
					description={renderGuestDescription(labels.successGuestDescription, email)}
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
