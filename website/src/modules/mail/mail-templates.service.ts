import { campaignSubmissionConfig } from '@/lib/campaign-submission';
import { defaultCurrency, defaultLanguage } from '@/lib/i18n/utils';
import { resultOk, type Result } from '@/lib/result';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import { createMonthlySummaryEmail } from '@/modules/monthly-summaries/monthly-summary-email.service';
import type { CampaignCreatedEmailData, CampaignEditedEmailData, NotificationContent, RenderedEmail } from './mail.types';

export const renderNotification = (content: NotificationContent): Result<RenderedEmail> => {
	switch (content.type) {
		case 'monthly-summary':
			return createMonthlySummaryEmail(content.data);
		case 'campaign-created':
			return resultOk(renderCampaignCreated(content.data));
		case 'campaign-edited':
			return resultOk(renderCampaignEdited(content.data));
	}
};

const renderCampaignCreated = (campaign: CampaignCreatedEmailData): RenderedEmail => ({
	subject: `Campaign created: ${campaign.title}`,
	text: `Hi,

${campaign.creatorName} created the campaign "${campaign.title}". The campaign page is live. ${campaign.public ? 'It appears in the public campaign list once it is approved in Storyblok.' : 'It is private and will not be listed.'}

Goal: ${campaign.goal === null ? 'none' : `${campaign.currency} ${campaign.goal}`}
Ends: ${campaign.endDate.toISOString().slice(0, 10)}
${campaign.hasAccount ? '' : 'The creator has no account yet; the campaign is linked once they sign in.\n'}
${formatCampaignLinks(campaign)}`,
});

const renderCampaignEdited = (campaign: CampaignEditedEmailData): RenderedEmail => ({
	subject: `Campaign edited: ${campaign.title}`,
	text: `Hi,

${campaign.editorName} edited the campaign "${campaign.title}". The changes are live.

Changed: ${campaign.changedFields.join(', ')}
${campaign.hadUnpublishedChanges ? '\nThe story had unpublished changes in Storyblok, which are now published too.\n' : ''}
${formatCampaignLinks(campaign)}`,
});

const formatCampaignLinks = (campaign: { slug: string; storyId: number }) => {
	const baseUrl = process.env.BASE_URL?.replace(TRAILING_SLASHES_REGEX, '') ?? '';
	const campaignUrl = `${baseUrl}${getWebsitePublicPath(defaultLanguage, defaultCurrency, `campaigns/${campaign.slug}`)}`;
	const storyblokUrl = `https://app.storyblok.com/#/me/spaces/${campaignSubmissionConfig.storyblokSpaceId}/stories/0/0/${campaign.storyId}`;

	return `Campaign: ${campaignUrl}
Storyblok: ${storyblokUrl}
`;
};
