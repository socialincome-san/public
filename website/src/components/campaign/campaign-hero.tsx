import { BlockWrapper } from '@/components/block-wrapper';
import { CampaignDonationFormServer } from '@/components/campaign/campaign-donation/campaign-donation-form-server';
import { getCampaignDaysRemaining } from '@/components/campaign/get-campaign-days-remaining';
import { Progress } from '@/components/progress/progress';
import type { HeroHeaderImage } from '@/components/storyblok/shared/hero-header';
import type { Translator } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { isCampaignActive } from '@/lib/services/campaign/campaign-public-activity';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import NextImage from 'next/image';
import type { ReactNode } from 'react';

const HERO_HEADER_IMAGE_WIDTH = 1920;
const HERO_HEADER_IMAGE_HEIGHT = 1080;

type Props = {
	campaign: CampaignPage;
	title: string;
	creatorName: string;
	quote: string;
	primaryImage?: HeroHeaderImage | null;
	profilePicture?: HeroHeaderImage | null;
	translator: Translator;
	lang: WebsiteLanguage;
};

type HeroStatProps = {
	label: string;
	value: string;
	trailing?: ReactNode;
	progress: number;
};

const HeroStat = ({ label, value, trailing, progress }: HeroStatProps) => (
	<div className="flex min-w-0 flex-1 flex-col gap-3">
		<div className="flex items-end justify-between gap-4">
			<div className="flex min-w-0 flex-col gap-1">
				<p className="text-sm font-medium">{label}</p>
				<p className="text-4xl font-normal md:text-6xl">{value}</p>
			</div>
			{trailing}
		</div>
		<Progress value={progress} variant="onDark" className="h-2" />
	</div>
);

export const CampaignHero = ({
	campaign,
	title,
	creatorName,
	quote,
	primaryImage,
	profilePicture,
	translator,
	lang,
}: Props) => {
	const hasGoal = campaign.goal !== null && campaign.goal !== undefined;
	const raisedPercent = campaign.percentageCollected ?? 0;
	const isActive = isCampaignActive({
		endDate: campaign.endDate,
		goal: campaign.goal,
		amountCollected: campaign.amountCollected,
	});
	const heroImageSrc = primaryImage?.filename
		? formatStoryblokUrl(primaryImage.filename, HERO_HEADER_IMAGE_WIDTH, HERO_HEADER_IMAGE_HEIGHT, primaryImage.focus)
		: null;
	const heroImageAlt = primaryImage?.alt ?? title;
	const locale = getSafeNumberFormatLocale(lang);
	const { remainingDays, progress: daysProgress } = getCampaignDaysRemaining({
		endDate: campaign.endDate,
		createdAt: campaign.createdAt,
	});
	const donationFormProps = {
		lang,
		campaignId: campaign.id,
		quote,
		creatorName,
		profilePicture,
	};

	return (
		<section className="full-bleed-hero flex flex-col gap-6">
			<div className="bg-foreground relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden rounded-b-3xl md:min-h-160 md:rounded-b-[56px]">
				{heroImageSrc ? (
					<NextImage src={heroImageSrc} alt={heroImageAlt} fill sizes="100vw" className="object-cover" priority />
				) : (
					<div className="bg-primary/20 absolute inset-0" />
				)}

				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--foreground))_0%,hsl(var(--foreground)/0.85)_22%,transparent_55%)]" />

				<div className="text-primary-foreground w-site-width max-w-content absolute inset-0 z-20 mx-auto mb-8 flex flex-row items-end justify-between gap-8 md:mb-24">
					<div className="flex min-w-0 flex-1 flex-col gap-10 px-4">
						<div className="flex max-w-2xl flex-col gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
							<p className="text-lg">{translator.t('campaign.by', { context: { creator: creatorName } })}</p>
							<h1 className="text-5xl leading-tight font-bold text-pretty md:text-6xl">{title}</h1>
						</div>

						<div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-16">
							<HeroStat
								label={translator.t('campaigns-page.raised-percentage', {
									namespace: 'website-common',
									context: {
										percentage: raisedPercent,
										currency: campaign.currency,
									},
								})}
								value={formatNumberLocale(campaign.amountCollected ?? 0, locale)}
								trailing={
									hasGoal ? (
										<p className="pb-1 text-xl font-medium opacity-40">
											{formatNumberLocale(campaign.goal ?? 0, locale)}
										</p>
									) : null
								}
								progress={raisedPercent}
							/>
							<HeroStat
								label={translator.t('campaign.days-left')}
								value={formatNumberLocale(remainingDays, locale)}
								progress={daysProgress}
							/>
						</div>
					</div>

					{isActive ? (
						<div className="hidden shrink-0 lg:block">
							<CampaignDonationFormServer {...donationFormProps} />
						</div>
					) : null}
				</div>
			</div>

			{isActive ? (
				<BlockWrapper className="lg:hidden" disableMarginTop={true}>
					<CampaignDonationFormServer {...donationFormProps} />
				</BlockWrapper>
			) : null}
		</section>
	);
};
