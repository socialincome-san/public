import {
	getCampaignFundraisingPillMessages,
	type FundraisingPillMessage,
} from '@/components/campaign/get-campaign-fundraising-pill-messages';
import type { Translator } from '@/lib/i18n/translator';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';

const buildFundraisingPillLabel = (message: FundraisingPillMessage, translator: Translator, locale: string): string => {
	switch (message.type) {
		case 'days-left':
			return translator.t('campaign.fundraising-pill.days-left', {
				context: { count: message.remainingDays },
			});
		case 'amount-missing':
			return translator.t('campaign.fundraising-pill.amount-missing', {
				context: {
					missing: formatCurrencyLocale(message.missing, message.currency, locale, { maximumFractionDigits: 0 }),
					goal: formatCurrencyLocale(message.goal, message.currency, locale, { maximumFractionDigits: 0 }),
				},
			});
		case 'supporters-left':
			return translator.t('campaign.fundraising-pill.supporters-left', {
				context: { count: message.supportersLeft, goal: message.supporterGoal },
			});
	}
};

export const buildCampaignFundraisingPillLabels = (
	campaign: CampaignPage,
	remainingDays: number,
	translator: Translator,
	locale: string,
): string[] => {
	const messages = getCampaignFundraisingPillMessages(campaign, remainingDays);

	return messages.map((message) => buildFundraisingPillLabel(message, translator, locale));
};
