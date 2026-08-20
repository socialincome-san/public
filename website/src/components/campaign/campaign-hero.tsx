import { BlockWrapper } from '@/components/block-wrapper';
import { DonationFormServer } from '@/components/donation-wizard/donation-form-server';
import { Progress } from '@/components/progress';
import type { HeroHeaderImage } from '@/components/storyblok/shared/hero-header';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { isCampaignActive } from '@/lib/services/campaign/campaign-public-activity';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import NextImage from 'next/image';

const HERO_HEADER_IMAGE_WIDTH = 1920;
const HERO_HEADER_IMAGE_HEIGHT = 1080;

type Props = {
	campaign: CampaignPage;
	title: string;
	creatorName: string;
	primaryImage?: HeroHeaderImage | null;
	translator: Translator;
	lang: WebsiteLanguage;
};

export const CampaignHero = ({ campaign, title, creatorName, primaryImage, translator, lang }: Props) => {
	const hasGoal = campaign.goal !== null && campaign.goal !== undefined;
	const showProgress = campaign.percentageCollected !== null && campaign.percentageCollected !== undefined;
	const showAmount = campaign.amountCollected !== null;
	const isActive = isCampaignActive({
		endDate: campaign.endDate,
		goal: campaign.goal,
		amountCollected: campaign.amountCollected,
	});
	const heroImageSrc = primaryImage?.filename
		? formatStoryblokUrl(primaryImage.filename, HERO_HEADER_IMAGE_WIDTH, HERO_HEADER_IMAGE_HEIGHT, primaryImage.focus)
		: null;
	const heroImageAlt = primaryImage?.alt ?? title;

	return (
		<section className="full-bleed-hero flex flex-col gap-6">
			<div className="bg-foreground relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden rounded-b-3xl md:min-h-160 md:rounded-b-[56px]">
				{heroImageSrc ? (
					<NextImage src={heroImageSrc} alt={heroImageAlt} fill sizes="100vw" className="object-cover" priority />
				) : (
					<div className="bg-primary/20 absolute inset-0" />
				)}

				<div className="from-foreground/70 via-foreground/35 to-foreground/15 absolute inset-0 bg-gradient-to-t" />

				<div className="text-primary-foreground w-site-width max-w-content absolute inset-0 z-20 mx-auto mb-8 flex flex-row items-end justify-between gap-4 md:mb-24">
					<div className="text-primary-foreground flex max-w-2xl flex-col gap-4">
						<p className="text-lg">{translator.t('campaign.by', { context: { creator: creatorName } })}</p>
						<h1 className="text-5xl leading-tight font-bold md:text-6xl">{title}</h1>
					</div>

					{isActive ? (
						<div className="hidden shrink-0 lg:block">
							<DonationFormServer lang={lang} campaignId={campaign.id} />
						</div>
					) : null}
				</div>
			</div>

			{isActive ? (
				<BlockWrapper className="lg:hidden" disableMarginTop={true} disableMarginBottom={true}>
					<DonationFormServer lang={lang} campaignId={campaign.id} />
				</BlockWrapper>
			) : null}

			{(!hasGoal && showAmount) || showProgress || !isActive ? (
				<div className="w-site-width max-w-content mx-auto flex flex-col gap-6 px-6 pb-12 md:pb-16">
					{!hasGoal && showAmount && (
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

					{!isActive && (
						<p className="text-destructive text-lg font-medium">
							{translator.t('campaign.ended', { context: { count: campaign.daysLeft } })}
						</p>
					)}
				</div>
			) : null}
		</section>
	);
};
