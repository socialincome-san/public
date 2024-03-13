import { DefaultPageProps } from '@/app/[lang]/[region]';
import OneTimeDonationForm from '@/app/[lang]/[region]/donate/one-time/one-time-donation-form';
import { VimeoVideo } from '@/components/vimeo-video';
import { firestoreAdmin } from '@/firebase-admin';
import { WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { getMetadata } from '@/metadata';
import { CAMPAIGN_FIRESTORE_PATH, Campaign, CampaignStatus } from '@socialincome/shared/src/types/campaign';
import { daysUntilTs } from '@socialincome/shared/src/utils/date';
import { getLatestExchangeRate } from '@socialincome/shared/src/utils/exchangeRates';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	BaseContainer,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
} from '@socialincome/ui';
import { Progress } from '@socialincome/ui/src/components/progress';

export type CampaignPageProps = {
	params: {
		country: WebsiteRegion;
		lang: WebsiteLanguage;
		campaign: string;
	};
} & DefaultPageProps;

export async function generateMetadata({ params }: CampaignPageProps) {
	const campaignDoc = await firestoreAdmin.collection<Campaign>(CAMPAIGN_FIRESTORE_PATH).doc(params.campaign).get();
	const campaign = campaignDoc.data();
	const campaignMetadata =
		campaign?.metadata_description && campaign?.metadata_ogImage && campaign?.metadata_twitterImage
			? {
					title: campaign?.title,
					description: campaign?.metadata_description,
					openGraph: {
						title: campaign?.title,
						description: campaign?.metadata_description,
						images: campaign?.metadata_ogImage,
					},
					twitter: {
						title: campaign?.title,
						card: 'summary_large_image',
						site: '@so_income',
						creator: '@so_income',
						images: campaign?.metadata_twitterImage,
					},
			  }
			: undefined;
	return getMetadata(params.lang, 'website-donate', campaignMetadata);
}

export default async function Page({ params }: CampaignPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-donate', 'website-videos'],
	});

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
					<div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
						<div className="flex flex-col justify-center gap-3">
							<div>
								<Typography size="xl" color="primary">
									{translator.t('campaign.by', { context: { creator: campaign.creator_name } })}
								</Typography>
							</div>
							<div>
								<Typography weight="medium" color="primary" style={{ lineHeight: '70px' }} className="mt-2 text-[4rem]">
									{campaign.title}
								</Typography>
							</div>
							<div className="my-8">
								<Typography size="2xl" color="primary">
									{campaign.description}
								</Typography>
							</div>
							<div>
								{!campaign.goal && (
									<div className="mb-4 flex flex-col">
										<Typography size="2xl" weight="medium" color="accent">
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
									<div>
										<div className="flex pb-2">
											<div className="flex-1 text-left">
												<Typography size="md" color="primary">
													{translator.t('campaign.with-goal.collected-percentage', {
														context: {
															percentage: percentageCollected,
														},
													})}
												</Typography>
											</div>
											<div className="flex-1 text-right">
												<Typography size="md" color="primary">
													{translator.t('campaign.with-goal.goal-title')}
												</Typography>
											</div>
										</div>
										<div>
											<Progress value={percentageCollected} className={'h-6'} />
										</div>
										<div className="flex pt-2">
											<div className="flex-1 text-left">
												<Typography size="md" color="primary">
													{translator.t('campaign.with-goal.collected-amount', {
														context: {
															count: contributions,
															amount: amountCollected,
															currency: campaign.goal_currency,
														},
													})}
												</Typography>
											</div>
											<div className="flex-1 text-right">
												<Typography size="md" color="primary">
													{translator.t('campaign.with-goal.goal-amount', {
														context: {
															amount: campaign.goal,
															currency: campaign.goal_currency,
														},
													})}
												</Typography>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
						{daysLeft >= 0 && (
							<>
								<div className="flex items-center justify-center" style={{ height: '500px' }}>
									<div className="card bg-primary w-full rounded-xl p-6">
										<div>
											<Typography size="xl" color="popover">
												{translator.t('campaign.card-title')}
											</Typography>
										</div>
										<div className="mt-3">
											<OneTimeDonationForm
												lang={params.lang}
												region={params.region}
												translations={{
													oneTime: translator.t('donation-interval.0.title'),
													monthly: translator.t('donation-interval.1.title'),
													amount: translator.t('amount'),
													submit: translator.t('button-text-short'),
												}}
												campaignId={params.campaign}
											/>
										</div>
										{daysLeft >= 0 && (
											<>
												<div className="mt-4 text-center">
													<Typography size="md" color="popover">
														{translator?.t('campaign.days-left', { context: { count: daysLeft } })}
													</Typography>
												</div>
											</>
										)}
										{daysLeft < 0 && (
											<div className="mt-4 text-center">
												<Typography size="md" color="popover">
													{translator?.t('campaign.ended', { context: { count: daysLeft } })}
												</Typography>
											</div>
										)}
									</div>
								</div>
							</>
						)}
						{daysLeft < 0 && (
							<div className="flex flex-col justify-center">
								<Typography size="xl" weight="medium" color="accent">
									{translator?.t('campaign.ended', { context: { count: daysLeft } })}
								</Typography>
							</div>
						)}
					</div>
				</div>
			</BaseContainer>
			{campaign.second_description && campaign.third_description && (
				<BaseContainer>
					<div className="grid grid-cols-1 gap-20 py-16 lg:grid-cols-2">
						<div>
							<div className="flex flex-col justify-center">
								<Typography size="2xl" color="primary" weight="medium">
									{campaign.second_description_title}
								</Typography>
							</div>
							<div className="flex flex-col justify-center">
								<Typography className={'mt-4'} color="primary" size="xl">
									{campaign.second_description}
								</Typography>
							</div>
						</div>
						<div>
							<div className="flex flex-col justify-center">
								<Typography size="2xl" color="primary" weight="medium">
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
			)}
			<BaseContainer>
				<div className="grid grid-cols-1 gap-20 py-8 lg:grid-cols-2 lg:py-16">
					<div>
						<div className="flex flex-col justify-center">
							<Typography size="2xl" color="primary" weight="medium">
								{translator.t('campaign.about-si-title')}
							</Typography>
						</div>
						<div className="flex flex-col justify-center">
							<Typography className={'mt-4'} color="primary" size="xl">
								{translator.t('campaign.about-si-text-1')}
							</Typography>
							<Typography className={'mt-4'} color="primary" size="xl">
								{translator.t('campaign.about-si-text-2')}
							</Typography>
							<Typography
								className={'mt-4 underline'}
								color="primary"
								size="xl"
								dangerouslySetInnerHTML={{ __html: translator.t('campaign.about-si-link') }}
							/>
						</div>
					</div>
					<div className="items-left flex flex-col">
						<div className="aspect-video overflow-hidden rounded-lg">
							<VimeoVideo videoId={Number(translator.t('id.video-01'))} />
						</div>
						<div className="mt-2 self-end">
							<Popover openDelay={0} closeDelay={200}>
								<PopoverTrigger>
									<Typography color="primary">{translator.t('credits')}</Typography>
								</PopoverTrigger>
								<PopoverContent align="end" className="w-96">
									<Table>
										<TableBody>
											{translator
												.t<{ role: string; name: string }[]>('video-01.credits')
												.map(({ role, name }, index) => (
													<TableRow key={index}>
														<TableCell className="p-1.5 font-medium">{role}</TableCell>
														<TableCell className="p-1.5">{name}</TableCell>
													</TableRow>
												))}
										</TableBody>
									</Table>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</div>
			</BaseContainer>
		</>
	);
}
