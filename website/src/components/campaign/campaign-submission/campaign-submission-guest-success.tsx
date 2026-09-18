'use client';

import { Button } from '@/components/button/button';
import { DialogHeader, DialogTitle } from '@/components/dialog';
import { Heart } from 'lucide-react';
import type { ReactNode } from 'react';
import { CampaignSubmissionFormCard, CampaignSubmissionFormCardColumn } from './form-layout';
import type { SubmissionLabels } from './types';

const SUPPORT_EMAIL = 'support@socialincome.org';
const EMAIL_PLACEHOLDER = '{{ email }}';

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
		<DialogHeader className="mx-0 shrink-0 px-6 pr-12 text-left">
			<DialogTitle className="leading-snug text-balance">{labels.successCreatedTitle}</DialogTitle>
		</DialogHeader>

		<CampaignSubmissionFormCardColumn>
			<CampaignSubmissionFormCard className="bg-donation-modal-gradient">
				<div className="flex flex-col items-center gap-6 py-4">
					<div className="flex items-center gap-2">
						<Heart className="text-foreground size-4 fill-current" strokeWidth={1.5} aria-hidden />
						<p className="text-foreground text-base leading-normal font-medium">{labels.successThankYou}</p>
					</div>

					<div className="flex w-full flex-col gap-4 text-center">
						<p className="text-foreground text-2xl leading-normal font-medium">{labels.successLiveTitle}</p>
						<p className="text-foreground text-base leading-normal">
							{renderGuestDescription(labels.successGuestDescription, email)}
						</p>
					</div>

					<div className="flex w-full flex-col items-center gap-3">
						<p className="text-foreground text-sm">{labels.successDidntGetIt}</p>
						<Button type="button" className="min-w-32" disabled={isRetrying} onClick={onRetry}>
							{isRetrying ? labels.successRetrySending : labels.successRetry}
						</Button>
					</div>

					<p className="text-foreground text-center text-sm leading-none">
						{labels.successSupportPrefix}{' '}
						<a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
							{SUPPORT_EMAIL}
						</a>
					</p>
				</div>
			</CampaignSubmissionFormCard>
		</CampaignSubmissionFormCardColumn>
	</div>
);
