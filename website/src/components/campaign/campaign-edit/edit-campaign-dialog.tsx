'use client';

import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getOwnCampaignForEditAction } from '@/modules/campaigns/campaign.actions';
import type { EditableCampaign } from '@/modules/campaigns/campaign.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isCampaignSubmissionErrorCode } from '../campaign-submission/campaign-submission.client';
import { EditCampaignForm, type EditCampaignLabels } from './edit-campaign-form';

type Props = {
	campaignId: string;
	editLabel: string;
	labels: EditCampaignLabels;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

type LoadState = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'ready'; campaign: EditableCampaign };

export const EditCampaignDialog = ({ campaignId, editLabel, labels, lang, currency }: Props) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [loadState, setLoadState] = useState<LoadState>({ kind: 'loading' });

	const openDialog = async () => {
		setLoadState({ kind: 'loading' });
		setOpen(true);

		const result = await getOwnCampaignForEditAction(campaignId).catch(() => null);
		if (!result?.success) {
			const message = result && isCampaignSubmissionErrorCode(result.error) ? labels.errors[result.error] : labels.error;
			setLoadState({ kind: 'error', message });

			return;
		}
		setLoadState({ kind: 'ready', campaign: result.data });
	};

	return (
		<>
			<Button type="button" size="sm" onClick={() => void openDialog()}>
				{editLabel}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent size="lg" height="fixed" padding="vertical">
					{loadState.kind === 'ready' ? (
						<EditCampaignForm
							campaign={loadState.campaign}
							labels={labels}
							lang={lang}
							currency={currency}
							onSaved={() => router.refresh()}
						/>
					) : (
						<DialogHeader>
							<DialogTitle>{editLabel}</DialogTitle>
							{loadState.kind === 'error' ? <p role="alert">{loadState.message}</p> : <AppLoadingSkeleton />}
						</DialogHeader>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};
