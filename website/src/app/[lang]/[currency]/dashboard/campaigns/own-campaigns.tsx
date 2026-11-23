import { buildCampaignSubmissionLabels } from '@/components/campaign/build-campaign-submission-labels';
import { EditCampaignDialog } from '@/components/campaign/campaign-edit/edit-campaign-dialog';
import { CreateCampaignButton } from '@/components/campaign/create-campaign-button';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import { formatCurrencyLocale, wholeCurrencyFormatOptions } from '@/lib/utils/string-utils';
import { getOwnCampaigns } from '@/modules/campaigns/campaign-edit.service';
import type { OwnCampaignListItem } from '@/modules/campaigns/campaign.types';
import { requireSession } from '@/server/session';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { ItemCard } from '@socialincome/design-system/data-display/item-card/item-card';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Props = {
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const OwnCampaigns = async ({ lang, currency }: Props) => {
	const contributor = await requireSession('contributor');
	const [t, tCommon, campaignsResult] = await Promise.all([
		getTranslations('website-me'),
		getTranslations('website-common'),
		getOwnCampaigns(contributor.id, lang),
	]);
	const submissionLabels = buildCampaignSubmissionLabels(tCommon);

	if (!campaignsResult.success) {
		return <p role="alert">{t('campaigns.error')}</p>;
	}

	if (campaignsResult.data.length === 0) {
		return (
			<div className="flex flex-col items-start gap-4">
				<p>{t('campaigns.empty')}</p>
				<CreateCampaignButton
					label={tCommon('campaigns-page.create-campaign')}
					labels={submissionLabels}
					lang={lang}
					currency={currency}
				/>
			</div>
		);
	}

	const editLabels = {
		...submissionLabels,
		save: t('campaigns.save'),
		saving: t('campaigns.saving'),
		savedTitle: t('campaigns.saved-title'),
		savedDescription: t('campaigns.saved-description'),
	};
	const formatAmount = (amount: number, campaignCurrency: string) =>
		formatCurrencyLocale(amount, campaignCurrency, lang, wholeCurrencyFormatOptions);

	const statusBadge = (campaign: OwnCampaignListItem) => {
		if (!campaign.isActive) {
			return <Badge variant="default">{t('campaigns.status.ended')}</Badge>;
		}
		if (!campaign.isPublic) {
			return <Badge variant="default">{t('campaigns.status.private')}</Badge>;
		}

		return campaign.isListed ? (
			<Badge variant="verified">{t('campaigns.status.listed')}</Badge>
		) : (
			<Badge variant="secondary">{t('campaigns.status.awaiting-approval')}</Badge>
		);
	};

	return (
		<div className="flex flex-col gap-4">
			{campaignsResult.data.map((campaign) => (
				<ItemCard
					key={campaign.id}
					title={campaign.title}
					badges={statusBadge(campaign)}
					stats={[
						...(campaign.amountCollected === null
							? []
							: [{ label: t('campaigns.raised'), value: formatAmount(campaign.amountCollected, campaign.currency) }]),
						...(campaign.goal === null
							? []
							: [{ label: t('campaigns.goal'), value: formatAmount(campaign.goal, campaign.currency) }]),
						{ label: t('campaigns.contributions'), value: String(campaign.contributionsCount) },
						...(campaign.isActive ? [{ label: t('campaigns.days-left'), value: String(campaign.daysLeft) }] : []),
					]}
					actions={
						<>
							<Button asChild variant="outline" size="sm">
								<Link href={getWebsitePublicPath(lang, currency, `campaigns/${campaign.slug}`)}>{t('campaigns.view')}</Link>
							</Button>
							<EditCampaignDialog
								campaignId={campaign.id}
								editLabel={t('campaigns.edit')}
								labels={editLabels}
								lang={lang}
								currency={currency}
							/>
						</>
					}
				/>
			))}
		</div>
	);
};
