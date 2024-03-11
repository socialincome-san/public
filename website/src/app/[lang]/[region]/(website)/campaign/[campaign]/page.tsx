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
import { getMetadata } from '@/metadata';
import { Progress } from '@socialincome/ui/src/components/progress';

export type CampaignPageProps = {
	params: {
		country: WebsiteRegion;
		lang: WebsiteLanguage;
		campaign: string;
	};
} & DefaultPageProps;

export async function generateMetadata({ params }: DefaultPageProps) {
	return getMetadata(params.lang, 'website-donate');
}

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
			<BaseContainer>
				<div className="py-12">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
						<div className="flex flex-col justify-center gap-3">
							<div>
								<Typography size="xl" color="primary">
									{translator.t("campaign.by", { context: { creator: campaign.creator_name } })}
								</Typography>
							</div>
							<div>
								<Typography weight="medium" color="primary" style={{ lineHeight: "70px" }} className="mt-2 text-[4rem]">
									{campaign.title}
								</Typography>
							</div>
							<div className="my-8">
								<Typography size="2xl" color="primary">
									{campaign.description}
								</Typography>
							</div>
							<div className="flex">
								<div className="flex-1 text-left">
									<Typography size="md" color="primary">
										{translator.t("campaign.with-goal.collected-percentage", {
											context: {
												percentage: percentageCollected
											}
										})}
									</Typography>
								</div>
								<div className="flex-1 text-right">
									<Typography size="md" color="primary">
										{translator.t("campaign.with-goal.goal-title")}
									</Typography>
								</div>
							</div>
							<div>
								<Progress value={percentageCollected} className={"h-5"} />
							</div>
							<div className="flex">
								<div className="flex-1 text-left">
									<Typography size="md" color="primary">
										{translator.t("campaign.with-goal.collected-amount", {
											context: {
												count: contributions,
												amount: amountCollected,
												currency: campaign.goal_currency
											}
										})}
									</Typography>
								</div>
								<div className="flex-1 text-right">
									<Typography size="md" color="primary">
										{translator.t("campaign.with-goal.goal-amount", {
											context: {
												amount: campaign.goal,
												currency: campaign.goal_currency
											}
										})}
									</Typography>
								</div>
							</div>
						</div>
						<div className="flex justify-center items-center" style={{ height: "500px" }}>
							<div className="card bg-primary rounded-lg p-6 w-full">
								<div>
									<Typography size="xl" color="popover">
										{translator.t("campaign.card-title")}
									</Typography>
								</div>
								<div className="mt-3">
									<OneTimeDonationForm
										lang={params.lang}
										region={params.region}
										translations={{
											oneTime: translator.t("donation-interval.0.title"),
											monthly: translator.t("donation-interval.1.title"),
											amount: translator.t("amount"),
											submit: translator.t("button-text")
										}}
										campaignId={params.campaign}
									/>
								</div>
								<div className="text-center mt-4">
									<Typography size="md" color="popover">
										{translator?.t("campaign.days-left", { context: { count: daysLeft } })}
									</Typography>
								</div>
							</div>
						</div>
					</div>
				</div>
			</BaseContainer>

			<Video lang={params.lang} />

			<BaseContainer>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-20 py-16">
						<div>
							<div className="flex flex-col justify-center">
								<Typography size="2xl" color="primary">
									{campaign.second_description_title}
								</Typography>
							</div>
							<div className="flex flex-col justify-center">
								<Typography className={"mt-4"} color="primary" size="xl">
									{campaign.second_description}
								</Typography>
							</div>
						</div>
						<div>
							<div className="flex flex-col justify-center">
								<Typography size="2xl" color="primary">
									{campaign.third_description_title}
								</Typography>
							</div>
							<div className="flex flex-col justify-center">
								<Typography className={'mt-4'} color="primary" size="xl">
									{campaign.third_description}
								</Typography>
							</div>
						</div>
					</div>
			</BaseContainer>
		</>
	);
}
