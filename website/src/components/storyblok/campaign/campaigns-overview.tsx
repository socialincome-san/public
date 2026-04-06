import { LandingPageCard } from '@/components/storyblok/shared/landing-page-card';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { CampaignStory } from './campaign.types';
import { getCampaignId, getCampaignSlug, getCampaignTitle } from './campaign.utils';

type Props = {
	campaigns: CampaignStory[];
	statsById: Record<string, { contributionsCount: number; daysLeft: number } | undefined>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignsOverview = async ({ campaigns, statsById, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<div className="flex w-full flex-col gap-6">
			{campaigns.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('campaigns-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{campaigns.map((campaign) => {
						const campaignId = getCampaignId(campaign.content);
						const campaignTitle = getCampaignTitle(campaign.content);
						const campaignSlug = getCampaignSlug(campaign);
						const stats = campaignId ? statsById[campaignId] : undefined;
						const heroImageFilename = campaign.content.heroImage.filename;
						const heroImageAlt = campaign.content.heroImage.alt ?? campaignTitle;

						return (
							<LandingPageCard
								key={campaign.uuid}
								href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/campaigns/${campaignSlug}`}
								title={campaignTitle}
								heroImageFilename={heroImageFilename}
								heroImageAlt={heroImageAlt}
								stats={
									stats
										? [
												{
													value: stats.contributionsCount,
													label:
														stats.contributionsCount === 1
															? translator.t('campaigns-page.contribution-singular')
															: translator.t('campaigns-page.contribution-plural'),
												},
												{
													value: stats.daysLeft,
													label:
														stats.daysLeft === 1
															? translator.t('campaigns-page.day-left-singular')
															: translator.t('campaigns-page.day-left-plural'),
												},
											]
										: []
								}
							/>
						);
					})}
				</ul>
			)}
		</div>
	);
};
