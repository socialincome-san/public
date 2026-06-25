import { DonationFormServer } from '@/components/donation-wizard/donation-form-server';
import { Progress } from '@/components/progress';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';

type Props = {
	campaign: CampaignPage;
	translator: Translator;
	lang: WebsiteLanguage;
};

export const CampaignHero = ({ campaign, translator, lang }: Props) => {
	const hasGoal = campaign.goal !== null && campaign.goal !== undefined;
	const showProgress = campaign.percentageCollected !== null && campaign.percentageCollected !== undefined;

	return (
		<section className="w-site-width max-w-content mx-auto px-6 py-12 md:py-16">
			<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
				<div className="flex flex-col gap-6">
					<p className="text-muted-foreground text-lg">
						{translator.t('campaign.by', { context: { creator: campaign.creatorName } })}
					</p>
					<h1 className="text-primary text-5xl font-bold md:text-6xl">{campaign.title}</h1>
					<p className="text-foreground text-lg">{campaign.description}</p>

					{!hasGoal && (
						<p className="text-primary text-xl font-bold">
							{translator.t('campaign.without-goal.collected', {
								context: {
									count: campaign.numberOfContributions,
									amount: campaign.amountCollected,
									currency: campaign.currency,
									total: campaign.goal,
								},
							})}
						</p>
					)}

					{showProgress && (
						<div className="flex flex-col gap-2">
							<div className="text-primary flex justify-between text-sm font-medium">
								<span>
									{translator.t('campaign.with-goal.collected-percentage', {
										context: { percentage: campaign.percentageCollected },
									})}
								</span>
								<span>{translator.t('campaign.with-goal.goal-title')}</span>
							</div>
							<Progress value={campaign.percentageCollected ?? 0} className="h-3" />
							<div className="text-primary flex justify-between text-sm">
								<span>
									{translator.t('campaign.with-goal.collected-amount', {
										context: {
											count: campaign.numberOfContributions,
											amount: campaign.amountCollected,
											currency: campaign.currency,
										},
									})}
								</span>
								<span>
									{translator.t('campaign.with-goal.goal-amount', {
										context: {
											amount: campaign.goal,
											currency: campaign.currency,
										},
									})}
								</span>
							</div>
						</div>
					)}

					{campaign.daysLeft < 0 && (
						<p className="text-destructive text-lg font-medium">
							{translator.t('campaign.ended', { context: { count: campaign.daysLeft } })}
						</p>
					)}
				</div>

				{campaign.daysLeft >= 0 && (
					<div className="flex w-full justify-center lg:justify-end">
						<DonationFormServer lang={lang} campaignId={campaign.id} />
					</div>
				)}
			</div>
		</section>
	);
};
