import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Video } from '@/app/[lang]/[region]/(website)/(home)/(sections)/video';
import OneTimeDonationForm from '@/app/[lang]/[region]/donate/one-time/one-time-donation-form';
import { firestoreAdmin } from '@/firebase-admin';
import { WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { CAMPAIGN_FIRESTORE_PATH, Campaign, CampaignStatus } from '@socialincome/shared/src/types/campaign';
import { daysUntilTs } from '@socialincome/shared/src/utils/date';
import { getLatestExchangeRate } from '@socialincome/shared/src/utils/exchangeRates';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { Progress } from '@socialincome/ui/src/components/progress';

export type CampaignPageProps = {
	params: {
		country: WebsiteRegion;
		lang: WebsiteLanguage;
		campaign: string;
	};
} & DefaultPageProps;

export default async function Page({ params }: CampaignPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: 'website-donate' });

	const campaignDoc = await firestoreAdmin.collection<Campaign>(CAMPAIGN_FIRESTORE_PATH).doc(params.campaign).get();
	const campaign = campaignDoc.data();

	if (!campaign || campaign.status === CampaignStatus.Inactive) {
		return (
			<BaseContainer className="mx-auto flex max-w-3xl flex-col pt-8 md:pt-16">
				<div className="flex flex-col items-center">
					<Typography size="3xl" weight="medium" className="mt-4">
						{translator.t('campaign.not-found')}
					</Typography>
				</div>
			</BaseContainer>
		);
	}

	const exchangeRate = campaign.goal_currency
		? await getLatestExchangeRate(firestoreAdmin, campaign.goal_currency)
		: 1.0;

	const contributions = campaign.contributions ?? 0;
	const amountCollected = Math.round((campaign.amount_collected_chf ?? 0) * exchangeRate);
	const percentageCollected = campaign.goal ? Math.round((amountCollected / campaign.goal) * 100) : undefined;
	const daysLeft = daysUntilTs(campaign.end_date.toDate());

	return (
		<>
			<BaseContainer className="-mx-2 flex flex-wrap">
				<div className="mb-4 w-full px-2 lg:w-1/2">
					<Typography size="xl" weight="bold" color="accent">
						{translator.t('campaign.by', { context: { creator: campaign.creator_name } })}
					</Typography>
					<Typography size="5xl" weight="bold" color="accent" className="mt-2">
						{campaign.title}
					</Typography>
				</div>
			</BaseContainer>
			<BaseContainer className="-mx-2 flex flex-wrap">
				<div className="mb-4 w-full px-2 lg:w-1/2">
					<Typography size="lg" weight="medium">
						{campaign.description}
					</Typography>
				</div>
				<div className="mb-4 w-full px-2  lg:w-1/2">
					<div>
						{!campaign.goal && (
							<div className="mb-4 flex flex-col items-center">
								<Typography size="2xl" weight="bold" color="accent">
									{translator?.t('campaign.without-goal.collected', {
										context: {
											count: contributions,
											amount: amountCollected,
											currency: campaign.goal_currency,
											total: campaign.goal,
										},
									})}
								</Typography>
							</div>
						)}
						{percentageCollected !== undefined && (
							<div className={'mb-6'}>
								<div className=" mb-1 flex font-medium">
									<div className="text-accent w-1/2">
										{translator.t('campaign.with-goal.collected-percentage', {
											context: {
												percentage: percentageCollected,
											},
										})}
									</div>
									<div className="text-primary w-1/2 text-right">{translator.t('campaign.with-goal.goal-title')}</div>
								</div>
								<div className="w-full">
									<Progress value={percentageCollected} className={'h-5 '} />
								</div>
								<div className=" mt-1 flex font-medium">
									<div className="text-accent w-1/2">
										{translator.t('campaign.with-goal.collected-amount', {
											context: {
												count: contributions,
												amount: amountCollected,
												currency: campaign.goal_currency,
											},
										})}
									</div>
									<div className=" text-primary w-1/2 text-right">
										{translator.t('campaign.with-goal.goal-amount', {
											context: {
												amount: campaign.goal,
												currency: campaign.goal_currency,
											},
										})}
									</div>
								</div>
							</div>
						)}
					</div>
					{daysLeft >= 0 && (
						<>
							<div className="flex flex-col items-center">
								<Typography size="xl" weight="bold" color="accent">
									{translator?.t('campaign.days-left', { context: { count: daysLeft } })}
								</Typography>
							</div>
							<div className="mt-4 w-full">
								<OneTimeDonationForm
									lang={params.lang}
									region={params.region}
									translations={{
										oneTime: translator.t('donation-interval.0.title'),
										monthly: translator.t('donation-interval.1.title'),
										amount: translator.t('amount'),
										submit: translator.t('button-text'),
									}}
									campaignId={params.campaign}
								/>
							</div>
						</>
					)}
					{daysLeft < 0 && (
						<div className="flex flex-col items-center">
							<Typography size="xl" weight="bold" color="accent">
								{translator?.t('campaign.ended', { context: { count: daysLeft } })}
							</Typography>
						</div>
					)}
				</div>
			</BaseContainer>
			<Video lang={params.lang} />
			{campaign.second_description && campaign.third_description && (
				<BaseContainer className="-mx-2 flex flex-wrap">
					<div className="-full mb-4 px-2 lg:w-1/2">
						<Typography size="xl" weight="medium">
							{campaign.second_description_title}
						</Typography>
						<Typography className={'mt-4'} weight="medium">
							{campaign.second_description}
						</Typography>
					</div>
					<div className="-full mb-4 px-2 lg:w-1/2">
						<Typography size="xl" weight="medium">
							{campaign.third_description_title}
						</Typography>
						<Typography className={'mt-4'} weight="medium">
							{campaign.third_description}
						</Typography>
					</div>
				</BaseContainer>
			)}
		</>
	);
}
