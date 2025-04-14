import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Approach } from '@/app/[lang]/[region]/(website)/(home)/(sections)/approach';
import { FAQ } from '@/app/[lang]/[region]/(website)/(home)/(sections)/faq';
import { Quotes } from '@/app/[lang]/[region]/(website)/(home)/(sections)/quotes';
import { SDGGoals } from '@/app/[lang]/[region]/(website)/(home)/(sections)/sdg-goals';
import { Testimonials } from '@/app/[lang]/[region]/(website)/(home)/(sections)/testimonials';
import { firestoreAdmin } from '@/firebase-admin';
import { CAMPAIGN_FIRESTORE_PATH, Campaign, CampaignStatus } from '@socialincome/shared/src/types/campaign';
import { CONTRIBUTION_FIRESTORE_PATH, Contribution } from '@socialincome/shared/src/types/contribution';
import { Timestamp } from 'firebase/firestore';
import { ActiveFundraisers } from './(sections)/active-fundraisers';
import { ExplainerVideo } from './(sections)/explainer-video';
import { HeroVideo } from './(sections)/hero-video';
import { MobileIllustration } from './(sections)/mobile-illustration';
import { MonthlyIncome } from './(sections)/monthly-income';
import { Overview } from './(sections)/overview';
const NUMBER_OF_CAMPAIGNS_TO_CHOOSE = 3;
const NUMBER_OF_RETRIES = 10;

const chooseIndicesRandomly = (length: number): number[] => {
	const randomIndicesSet = new Set<number>();
	console.log('length', length);
	if (!length) {
		return [];
	}
	for (let i = 0; i < NUMBER_OF_RETRIES; ++i) {
		const randomIndex = Math.floor(Math.random() * length);
		if (!randomIndicesSet.has(randomIndex)) {
			randomIndicesSet.add(randomIndex);
			if (randomIndicesSet.size == NUMBER_OF_CAMPAIGNS_TO_CHOOSE) {
				break;
			}
		}
	}
	return [...randomIndicesSet];
};

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const completeCampaignData = await firestoreAdmin.collection<Campaign>(CAMPAIGN_FIRESTORE_PATH).get();
	const campaignStatsEntries = completeCampaignData.docs.filter(
		(campaignData) =>
			campaignData.get('status') == CampaignStatus.Active &&
			campaignData.get('featured') &&
			campaignData.get('end_date') > Timestamp.now(),
	);
	console.log('campaignStatEntries', campaignStatsEntries);
	const randomlyChosenCampaignIndices = chooseIndicesRandomly(campaignStatsEntries.length);
	const selectedCampaigns = [...randomlyChosenCampaignIndices].map((index) => campaignStatsEntries[index]);
	let campaignProps = [];
	for (const campaignData of selectedCampaigns) {
		// const exchangeRate = campaignData.get('goal_currency')
		// 	? await getLatestExchangeRate(firestoreAdmin, campaignData.get('goal_currency'))
		// 	: 1.0;
		console.log(campaignData.id);
		const contributions = await firestoreAdmin
			.collectionGroup<Contribution>(CONTRIBUTION_FIRESTORE_PATH)
			.where('campaign_path', '==', firestoreAdmin.firestore.collection(CAMPAIGN_FIRESTORE_PATH).doc(campaignData.id))
			.get();
		let amountCollected = contributions.docs.reduce((sum, c) => sum + c?.data().amount_chf, 0);

		//TODO: Exchange rate not considered, therefore slight inaccuracy in calculation
		amountCollected += campaignData.get('additional_amount_chf') || 0;
		// amountCollected *= exchangeRate;

		const percentageCollected = campaignData.get('goal')
			? Math.round((amountCollected / campaignData.get('goal')) * 100)
			: undefined;
		campaignProps.push({
			id: campaignData.id,
			creatorName: campaignData.get('creator_name'),
			title: campaignData.get('title'),
			amountCollected: Math.round(amountCollected),
			goalCurrency: campaignData.get('goal_currency'),
			percentageCollected: percentageCollected || undefined,
			contributorCount: contributions.docs.length,
		});
	}
	return (
		<div className="hero-video -mb-28 -mt-24 md:-mt-36">
			<HeroVideo lang={lang} region={region} />
			<ActiveFundraisers
				lang={lang}
				region={region}
				campaignProps={campaignProps}
				totalCampaignCount={campaignStatsEntries.length}
			/>
			<Overview lang={lang} region={region} />
			<MonthlyIncome lang={lang} region={region} />
			<ExplainerVideo lang={lang} region={region} />
			<MobileIllustration lang={lang} region={region} />
			<FAQ lang={lang} region={region} />
			<Approach lang={lang} region={region} />
			<Quotes lang={lang} region={region} />
			{/*<RecipientSelection lang={lang} region={region} />*/}
			<SDGGoals lang={lang} region={region} />
			<Testimonials lang={lang} region={region} />
		</div>
	);
}
