import type { AuditContext } from '@/lib/audit/audit-types';
import { campaignSubmissionConfig } from '@/lib/campaign-submission';
import { defaultCurrency, defaultLanguage } from '@/lib/i18n/utils';
import { resultOk, type Result } from '@/lib/result';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import { sendNotification } from '@/modules/mail/mail.service';

type NotifiedCampaign = { id: string; slug: string; title: string; storyId: number };

export const notifyStaffOfCampaignCreated = async (
	campaign: NotifiedCampaign & {
		creatorName: string;
		goal: number | null;
		currency: string;
		endDate: Date;
		public: boolean;
		hasAccount: boolean;
	},
): Promise<Result<void>> => {
	const text = `Hi,

${campaign.creatorName} created the campaign "${campaign.title}". The campaign page is live. ${campaign.public ? 'It appears in the public campaign list once it is approved in Storyblok.' : 'It is private and will not be listed.'}

Goal: ${campaign.goal === null ? 'none' : `${campaign.currency} ${campaign.goal}`}
Ends: ${campaign.endDate.toISOString().slice(0, 10)}
${campaign.hasAccount ? '' : 'The creator has no account yet; the campaign is linked once they sign in.\n'}
${formatLinks(campaign)}`;

	const result = await sendNotification({
		type: 'campaign-created',
		subject: `Campaign created: ${campaign.title}`,
		text,
		idempotencyKey: `campaign-created:${campaign.id}`,
		campaignId: campaign.id,
	});
	if (!result.success) {
		console.error('Campaign created notification failed', { slug: campaign.slug, error: result.error });

		return result;
	}

	return resultOk(undefined);
};

export const notifyStaffOfCampaignEdit = async (
	audit: AuditContext,
	campaign: NotifiedCampaign & { hadUnpublishedChanges: boolean },
	changedFields: string[],
): Promise<Result<void>> => {
	const text = `Hi,

${audit.actor.name ?? audit.actor.id} edited the campaign "${campaign.title}". The changes are live.

Changed: ${changedFields.join(', ')}
${campaign.hadUnpublishedChanges ? '\nThe story had unpublished changes in Storyblok, which are now published too.\n' : ''}
${formatLinks(campaign)}`;

	const result = await sendNotification({
		type: 'campaign-edited',
		subject: `Campaign edited: ${campaign.title}`,
		text,
		campaignId: campaign.id,
	});
	if (!result.success) {
		console.error('Campaign edit notification failed', { slug: campaign.slug, error: result.error });

		return result;
	}

	return resultOk(undefined);
};

const formatLinks = (campaign: NotifiedCampaign) => {
	const baseUrl = process.env.BASE_URL?.replace(TRAILING_SLASHES_REGEX, '') ?? '';
	const campaignUrl = `${baseUrl}${getWebsitePublicPath(defaultLanguage, defaultCurrency, `campaigns/${campaign.slug}`)}`;
	const storyblokUrl = `https://app.storyblok.com/#/me/spaces/${campaignSubmissionConfig.storyblokSpaceId}/stories/0/0/${campaign.storyId}`;

	return `Campaign: ${campaignUrl}
Storyblok: ${storyblokUrl}
`;
};
