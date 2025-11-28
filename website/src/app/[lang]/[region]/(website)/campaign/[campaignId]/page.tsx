import { DefaultParams } from '@/app/[lang]/[region]';
import { DonationInterval } from '@/components/legacy/donation/donation-interval';
import { GenericDonationForm } from '@/components/legacy/donation/generic-donation-form';
import NewsletterGlowContainer from '@/components/legacy/newsletter/glow-container/newsletter-glow-container';
import { VimeoVideo } from '@/components/legacy/vimeo-video';
import { CampaignService } from '@/lib/services/campaign/campaign.service';
import { ExchangeRateService } from '@/lib/services/exchange-rate/exchange-rate.service';
import { getMetadata } from '@/metadata';
import { daysUntilTs } from '@socialincome/shared/src/utils/date';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	BaseContainer,
	linkCn,
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
import Link from 'next/link';

interface CampaignPageParams extends DefaultParams {
	campaignId: string;
}

export type CampaignPageProps = {
	params: Promise<CampaignPageParams>;
};

export async function generateMetadata({ params }: CampaignPageProps) {
	const { campaignId, lang } = await params;
	const campaignService = new CampaignService();
	const result = await campaignService.getByLegacyId(campaignId);
	if (!result.success) {
		return getMetadata(lang, 'website-campaign');
	}
	const campaign = result.data;
	const campaignMetadata =
		campaign.metadataDescription && campaign?.metadataOgImage && campaign?.metadataTwitterImage
			? {
					title: campaign?.title,
					description: campaign?.metadataDescription,
					openGraph: {
						title: campaign?.title,
						description: campaign?.metadataDescription,
						images: campaign?.metadataOgImage,
					},
					twitter: {
						title: campaign?.title,
						card: 'summary_large_image',
						site: '@so_income',
						creator: '@so_income',
						images: campaign?.metadataTwitterImage,
					},
				}
			: undefined;
	return getMetadata(lang, 'website-campaign', campaignMetadata);
}

export default async function Page({ params }: CampaignPageProps) {
	const { lang, campaignId, region } = await params;
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign', 'website-donate', 'website-videos', 'website-faq', 'website-newsletter'],
	});

	const campaignService = new CampaignService();
	const exchangeRateService = new ExchangeRateService();
	const result = await campaignService.getByLegacyId(campaignId);

	console.log('result', result);

	if (!result.success || !result.data || !result.data.isActive) {
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

	const campaign = result.data;

	const exchangeRateRes = await exchangeRateService.getLatestRateForCurrency(campaign.currency);
	const exchangeRate = exchangeRateRes.success ? exchangeRateRes.data.rate : 1.0;

	let amountCollected = campaign.contributions?.reduce((sum, c) => sum + c.amountChf, 0) || 0;
	amountCollected += campaign.additionalAmountChf || 0;
	amountCollected *= exchangeRate;

	const percentageCollected = campaign.goal ? Math.round((amountCollected / campaign.goal) * 100) : undefined;
	const daysLeft = daysUntilTs(campaign.endDate);

	return (
		<>
			<BaseContainer>
				<div className="py-12">
					<div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
						<div className="flex flex-col justify-center gap-3">
							<div>
								<Typography size="xl" color="muted-foreground">
									{translator.t('campaign.by', { context: { creator: campaign.creatorName } })}
								</Typography>
							</div>
							<div>
								<Typography
									weight="medium"
									color="foreground"
									style={{ lineHeight: '70px' }}
									className="mt-2 text-[4rem]"
								>
									{campaign.title}
								</Typography>
							</div>
							<div className="my-8">
								<Typography size="2xl" color="muted-foreground">
									{campaign.description}
								</Typography>
							</div>
							<div>
								{!campaign.goal && (
									<div className="mb-4 flex flex-col">
										<Typography size="2xl" weight="medium" color="secondary">
											{translator?.t('campaign.without-goal.collected', {
												context: {
													count: campaign.contributions?.length,
													amount: amountCollected,
													currency: campaign.currency,
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
															count: campaign.contributions?.length,
															amount: amountCollected,
															currency: campaign.currency,
														},
													})}
												</Typography>
											</div>
											<div className="flex-1 text-right">
												<Typography size="md" color="primary">
													{translator.t('campaign.with-goal.goal-amount', {
														context: {
															amount: campaign.goal,
															currency: campaign.currency,
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
											<GenericDonationForm
												defaultInterval={DonationInterval.Monthly}
												lang={lang}
												region={region}
												translations={{
													oneTime: translator.t('donation-interval.0.title'),
													monthly: translator.t('donation-interval.1.title'),
													amount: translator.t('amount'),
													submit: translator.t('button-text-short'),
													paymentType: {
														bankTransfer: translator.t('payment-type.bank-transfer'),
														creditCard: translator.t('payment-type.credit-card'),
													},
													bankTransfer: {
														firstName: translator.t('success.user-form.firstname'),
														lastName: translator.t('success.user-form.lastname'),
														email: translator.t('success.user-form.email'),
														generateQrBill: translator.t('bank-transfer.generate-qr-bill'),
														standingOrderQrInfo: translator.t('bank-transfer.standing-order-qr-info'),
														confirmPayment: translator.t('bank-transfer.confirm-payment'),
														paymentSuccess: translator.t('bank-transfer.payment-success'),
														loginLink: translator.t('bank-transfer.login-link'),
														profileLink: translator.t('bank-transfer.profile-link'),
														processing: translator.t('bank-transfer.processing'),
														generating: translator.t('bank-transfer.generating'),
														errors: {
															emailRequired: translator.t('bank-transfer.errors.emailRequired'),
															emailInvalid: translator.t('bank-transfer.errors.emailInvalid'),
															qrBillError: translator.t('bank-transfer.errors.qrBillError'),
															paymentFailed: translator.t('bank-transfer.errors.paymentFailed'),
														},
													},
												}}
												campaignId={campaignId}
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
			{campaign.secondDescription && campaign.thirdDescription && (
				<BaseContainer>
					<div className="grid grid-cols-1 gap-20 py-16 lg:grid-cols-2">
						<div>
							<div className="flex flex-col justify-center">
								<Typography size="2xl" color="foreground" weight="medium">
									{campaign.secondDescriptionTitle}
								</Typography>
							</div>
							<div className="flex flex-col justify-center">
								<Typography className={'mt-4'} color="muted-foreground" size="xl">
									{campaign.secondDescription}
								</Typography>
							</div>
						</div>
						<div>
							<div className="flex flex-col justify-center">
								<Typography size="2xl" color="foreground" weight="medium">
									{campaign.thirdDescriptionTitle}
								</Typography>
							</div>
							<div className="flex flex-col justify-center">
								<Typography className={'mt-4'} color="muted-foreground" size="xl">
									{campaign.thirdDescription}
								</Typography>
							</div>
						</div>
					</div>
				</BaseContainer>
			)}
			<NewsletterGlowContainer
				title={translator.t('campaign.information-label')}
				lang={lang}
				formTranslations={{
					informationLabel: translator.t('popup.information-label'),
					toastSuccess: translator.t('popup.toast-success'),
					toastFailure: translator.t('popup.toast-failure'),
					emailPlaceholder: translator.t('popup.email-placeholder'),
					buttonAddSubscriber: translator.t('popup.button-subscribe'),
				}}
			/>
			<BaseContainer>
				<div className="grid grid-cols-1 gap-20 py-8 lg:grid-cols-2 lg:py-16">
					<div>
						<div className="flex flex-col justify-center">
							<Typography size="2xl" color="foreground" weight="medium">
								{translator.t('campaign.about-si-title')}
							</Typography>
						</div>
						<div className="flex flex-col justify-center">
							<Typography className={'mt-4'} color="muted-foreground" size="xl">
								{translator.t('campaign.about-si-text-1')}
							</Typography>
							<Typography className={'mt-4'} color="muted-foreground" size="xl">
								{translator.t('campaign.about-si-text-2')}
							</Typography>
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
			<BaseContainer>
				<div className="py-8 pb-32 lg:pt-16">
					<Typography size="2xl" color="foreground" weight="medium" className="pb-1">
						{translator.t('campaign.title')}
					</Typography>
					<div className="space-y-6">
						<Accordion type="single" collapsible className="w-full">
							{translator
								.t<
									{
										question: string;
										answer: string;
										links?: { title: string; href: string }[];
									}[]
								>('campaign.questions')
								.map(({ question, answer, links }, index) => (
									<AccordionItem value={`item-${index}`} key={index}>
										<AccordionTrigger>
											<Typography size="xl" color="muted-foreground" className="text-left" weight="normal">
												{question}
											</Typography>
										</AccordionTrigger>
										<AccordionContent>
											<Typography
												size="xl"
												color="muted-foreground"
												className="mt-2"
												dangerouslySetInnerHTML={{ __html: answer }}
											/>
											{links && (
												<ul className="mt-4 flex list-outside list-disc flex-col space-y-1 pl-3">
													{links.map((link: { title: string; href: string }, index: number) => (
														<li key={index} className="mb-0 pl-3">
															<Link
																className={linkCn({ underline: 'none' })}
																href={link.href}
																target="_blank"
																rel="noreferrer"
															>
																<Typography as="span" size="lg" color="primary" className="font-normal hover:underline">
																	{link.title}
																</Typography>
															</Link>
														</li>
													))}
												</ul>
											)}
										</AccordionContent>
									</AccordionItem>
								))}
						</Accordion>
					</div>
					<div className="flex flex-col items-center justify-center pt-4">
						<Typography
							className="mt-4 underline"
							color="muted-foreground"
							size="xl"
							dangerouslySetInnerHTML={{ __html: translator.t('campaign.more-faq') }}
						/>
					</div>
				</div>
			</BaseContainer>
		</>
	);
}
