import { DefaultPageProps } from '@/app/[lang]/[region]';
import OneTimeDonationForm from '@/app/[lang]/[region]/donate/one-time/one-time-donation-form';
import { firestoreAdmin } from '@/firebase-admin';
import { WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { CAMPAIGN_FIRESTORE_PATH, Campaign } from '../../../../../../../../shared/src/types/campaign';

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

	if (!campaign) {
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
	// TODOs
	// - styling
	// - add name
	// - add total amount
	// - add goal and progress bar if set
	return (
		<BaseContainer className="mx-auto flex max-w-3xl flex-col pt-8 md:pt-16">
			<div className="flex flex-col items-center">
				<Typography size="5xl" weight="bold" color="accent">
					{campaign.title}
				</Typography>
				<Typography size="xl" weight="medium" className="mt-4">
					{campaign.description}
				</Typography>
				<div className="mt-16 w-full">
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
			</div>
		</BaseContainer>
	);
}
