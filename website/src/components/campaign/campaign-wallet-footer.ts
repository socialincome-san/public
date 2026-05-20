import type { PublicCampaignStats } from '@/lib/services/campaign/campaign.types';

type Translate = (key: string) => string;

export const getCampaignWalletFooterProps = (stats: PublicCampaignStats | undefined, t: Translate) => {
	if (!stats) {
		return {};
	}

	return {
		footerLeft: {
			label:
				stats.contributionsCount === 1 ? t('campaigns-page.contribution-singular') : t('campaigns-page.contribution-plural'),
			prefix: null,
			value: String(stats.contributionsCount),
		},
		footerRight: {
			label: stats.daysLeft === 1 ? t('campaigns-page.day-left-singular') : t('campaigns-page.day-left-plural'),
			value: String(stats.daysLeft),
		},
	};
};
