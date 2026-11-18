import { resultOk, type Result } from '@/lib/result';
import { sendNotification } from '@/modules/mail/mail.service';
import type { CampaignCreatedEmailData, CampaignEditedEmailData } from '@/modules/mail/mail.types';

export const notifyStaffOfCampaignCreated = async (campaign: CampaignCreatedEmailData): Promise<Result<void>> => {
	const result = await sendNotification({
		type: 'campaign-created',
		data: campaign,
		idempotencyKey: `campaign-created:${campaign.id}`,
		campaignId: campaign.id,
	});
	if (!result.success) {
		console.error('Campaign created notification failed', { slug: campaign.slug, error: result.error });

		return result;
	}

	return resultOk(undefined);
};

export const notifyStaffOfCampaignEdit = async (campaign: CampaignEditedEmailData): Promise<Result<void>> => {
	const result = await sendNotification({ type: 'campaign-edited', data: campaign, campaignId: campaign.id });
	if (!result.success) {
		console.error('Campaign edit notification failed', { slug: campaign.slug, error: result.error });

		return result;
	}

	return resultOk(undefined);
};
