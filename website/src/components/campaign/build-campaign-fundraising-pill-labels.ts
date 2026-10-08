import {
	getCampaignFundraisingPillMessages,
	type FundraisingPillMessage,
} from '@/components/campaign/get-campaign-fundraising-pill-messages';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import type { CampaignPage } from '@/modules/campaigns/campaign.types';
import { type useTranslations } from 'next-intl';

type CampaignT = ReturnType<typeof useTranslations<'website-campaign'>>;

const buildFundraisingPillLabel = (message: FundraisingPillMessage, t: CampaignT, locale: string): string => {
	switch (message.type) {
		case 'days-left':
			return t('campaign.fundraising-pill.days-left', { count: message.remainingDays });
		case 'amount-missing':
			return t('campaign.fundraising-pill.amount-missing', {
				missing: formatCurrencyLocale(message.missing, message.currency, locale, { maximumFractionDigits: 0 }),
				goal: formatCurrencyLocale(message.goal, message.currency, locale, { maximumFractionDigits: 0 }),
			});
		case 'supporters-left':
			return t('campaign.fundraising-pill.supporters-left', { count: message.supportersLeft, goal: message.supporterGoal });
	}
};

export const buildCampaignFundraisingPillLabels = (
	campaign: CampaignPage,
	remainingDays: number,
	t: CampaignT,
	locale: string,
): string[] => {
	const messages = getCampaignFundraisingPillMessages(campaign, remainingDays);

	return messages.map((message) => buildFundraisingPillLabel(message, t, locale));
};
