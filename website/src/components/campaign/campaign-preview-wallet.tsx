import { Progress } from '@/components/progress';
import type { TranslateFunction } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage, type WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicCampaignCard, PublicCampaignStats } from '@/lib/services/campaign/campaign.types';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import NextImage from 'next/image';
import Link from 'next/link';

const CAMPAIGN_PREVIEW_PLACEHOLDER_IMAGE =
	'https://a.storyblok.com/f/109655/3000x2000/7f29d7f158/social-income-program-1.jpg';

type Props = {
	campaign: PublicCampaignCard;
	stats?: PublicCampaignStats;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	t: TranslateFunction;
};

export const CampaignPreviewWallet = ({ campaign, stats, lang, region, t }: Props) => {
	const href = `/${lang}/${region}/campaigns/${campaign.slug}`;
	const locale = getSafeNumberFormatLocale(lang);
	const showProgress = stats?.percentageCollected !== null && stats?.percentageCollected !== undefined;
	const contributionLabel =
		stats?.contributionsCount === 1 ? t('campaigns-page.contribution-singular') : t('campaigns-page.contribution-plural');
	const daysLabel = stats?.daysLeft === 1 ? t('campaigns-page.day-left-singular') : t('campaigns-page.day-left-plural');

	return (
		<Link href={href} className="group block h-full min-w-0">
			<article
				className="relative flex h-full min-h-[400px] flex-col overflow-hidden rounded-xl shadow-lg transition-transform group-hover:-translate-y-1 group-hover:shadow-xl"
				data-testid="campaign-preview-wallet"
			>
				<NextImage
					src={CAMPAIGN_PREVIEW_PLACEHOLDER_IMAGE}
					alt=""
					fill
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					className="object-cover"
				/>
				<div
					className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.35)_30%,rgb(8,51,68)_58%,rgb(8,51,68)_100%)]"
					aria-hidden
				/>
				<div className="relative min-h-[191px] flex-1" aria-hidden />
				<div className="relative z-10 px-6 pt-6 pb-8 text-white">
					{campaign.creatorName ? (
						<p className="text-sm leading-5 font-medium drop-shadow-sm">{campaign.creatorName}</p>
					) : null}
					<h3 className="mt-2 text-4xl leading-10 font-medium break-words drop-shadow-sm">{campaign.title}</h3>
					<div className="mt-6 flex items-end justify-between gap-4">
						<div className="min-w-0">
							{showProgress ? (
								<p className="text-sm leading-5 font-medium drop-shadow-sm">
									{t('campaigns-page.raised-percentage', {
										context: { percentage: stats?.percentageCollected, currency: campaign.currency },
									})}
								</p>
							) : null}
							{stats ? (
								<p className="text-4xl font-normal drop-shadow-sm lg:text-5xl xl:text-6xl">
									{formatNumberLocale(stats.amountCollected, locale)}
								</p>
							) : null}
						</div>
						{stats ? (
							<div className="shrink-0 text-right text-sm leading-5 font-medium drop-shadow-sm">
								<p>{`${stats.contributionsCount} ${contributionLabel}`}</p>
								<p>{`${stats.daysLeft} ${daysLabel}`}</p>
							</div>
						) : null}
					</div>
					{showProgress ? <Progress value={stats?.percentageCollected ?? 0} variant="onDark" className="mt-3 h-2" /> : null}
				</div>
			</article>
		</Link>
	);
};
