import { DefaultPageProps } from '@/app/[lang]/[region]';
import OneTimeDonationForm from '@/app/[lang]/[region]/donate/one-time/one-time-donation-form';
import { firestoreAdmin } from '@/firebase-admin';
import { WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { CAMPAIGN_FIRESTORE_PATH, Campaign, CampaignStatus } from '@socialincome/shared/src/types/campaign';
import { getLatestExchangeRate } from '@socialincome/shared/src/utils/exchangeRates';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { Progress } from '@socialincome/ui/src/components/progress';
import { Fragment } from 'react';

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

	if (campaign.goal) {
		console.log((campaign.amount_collected_chf * exchangeRate) / campaign.goal);
	}

	// TODOs
	// - styling
	// - wording
	return (
		<BaseContainer className="mx-auto flex max-w-3xl flex-col pt-8 md:pt-16">
			<div className="mb-14 flex flex-col items-center">
				<Typography size="5xl" weight="bold" color="accent">
					{campaign.title}
				</Typography>
				<Typography size="xl" weight="bold" color="accent" className="mt-4">
					{translator.t('campaign.by', { context: { creator: campaign.creator_name } })}
				</Typography>
				<Typography size="xl" weight="medium" className="mt-4">
					{campaign.description}
				</Typography>
			</div>
			{percentageCollected != undefined && (
				<div className="mb-4 w-full">
					<Progress value={percentageCollected} />
				</div>
			)}
			<div className="mb-14 flex flex-col items-center">
				<Typography size="2xl" weight="bold" color="accent">
					{translator?.t(campaign.goal ? 'campaign.collected-goal' : 'campaign.collected', {
						context: {
							count: contributions,
							amount: amountCollected,
							currency: campaign.goal_currency,
							total: campaign.goal,
						},
					})}
				</Typography>
			</div>
			{daysLeft >= 0 && (
				<Fragment>
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
								amount: translator.t('amount'),
								submit: translator.t('button-text'),
							}}
							campaignId={params.campaign}
						/>
					</div>
				</Fragment>
			)}
			{daysLeft < 0 && (
				<div className="flex flex-col items-center">
					<Typography size="xl" weight="bold" color="accent">
						{translator?.t('campaign.ended', { context: { count: daysLeft } })}
					</Typography>
				</div>
			)}
		</BaseContainer>
	);
}

const daysUntilTs = (ts: Date): number => {
	const diffInMs = ts.getTime() - new Date().getTime();
	return Math.ceil(diffInMs / (24 * 60 * 60 * 1000));
};
