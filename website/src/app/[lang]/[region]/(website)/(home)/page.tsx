import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Approach } from '@/app/[lang]/[region]/(website)/(home)/(sections)/approach';
import { FAQ } from '@/app/[lang]/[region]/(website)/(home)/(sections)/faq';
import { Quotes } from '@/app/[lang]/[region]/(website)/(home)/(sections)/quotes';
import { SDGGoals } from '@/app/[lang]/[region]/(website)/(home)/(sections)/sdg-goals';
import { Testimonials } from '@/app/[lang]/[region]/(website)/(home)/(sections)/testimonials';
import { firestoreAdmin } from '@/lib/firebase/firebase-admin';
import { Campaign } from '@socialincome/shared/src/types/campaign';
import { getLatestExchangeRate } from '@socialincome/shared/src/utils/exchangeRates';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { CampaignStatsCalculator } from '@socialincome/shared/src/utils/stats/CampaignStatsCalculator';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import _ from 'lodash';
import { ActiveFundraisers } from './(sections)/active-fundraisers';
import { ExplainerVideo } from './(sections)/explainer-video';
import { HeroVideo } from './(sections)/hero-video';
import { MobileIllustration } from './(sections)/mobile-illustration';
import { MonthlyIncome } from './(sections)/monthly-income';
import { Overview } from './(sections)/overview';

const chooseRandomCampaigns = (
	campaignStatsEntries: QueryDocumentSnapshot<Campaign>[],
	amount: number = 3,
): QueryDocumentSnapshot<Campaign>[] => {
	if (!campaignStatsEntries.length) return [];
	return _.sampleSize(campaignStatsEntries, amount);
};

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;
	const { lang, region } = params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-campaign'] });

	const campaignStatsCalculator = await CampaignStatsCalculator.build(firestoreAdmin);
	const selectedCampaigns = campaignStatsCalculator.getFilteredCampaigns();

	let campaignProps = [];

	for (const campaignData of chooseRandomCampaigns(selectedCampaigns)) {
		const exchangeRate = campaignData.get('goal_currency')
			? await getLatestExchangeRate(firestoreAdmin, campaignData.get('goal_currency'))
			: 1.0;
		const contributions = campaignStatsCalculator.getContributionsForCampaign(campaignData.id);
		let amountCollected = contributions.reduce((sum, c) => sum + c['amount_chf'], 0);
		amountCollected += campaignData.get('additional_amount_chf') || 0;
		amountCollected *= exchangeRate;

		const percentageCollected = campaignData.get('goal')
			? Math.round((amountCollected / campaignData.get('goal')) * 100)
			: undefined;
		campaignProps.push({
			id: campaignData.id,
			creatorName: campaignData.get('creator_name'),
			title: campaignData.get('title'),
			amountCollected: Math.round(amountCollected),
			goalCurrency: campaignData.get('goal_currency'),
			percentageCollected,
			contributorCount: contributions.length,
		});
	}

	return (
		<div className="hero-video -mb-28 -mt-24 md:-mt-36">
			<HeroVideo lang={lang} region={region} />
			<ActiveFundraisers
				lang={lang}
				region={region}
				campaignProps={campaignProps}
				translations={translator.t('badges')}
			/>
			<Overview lang={lang} region={region} />
			<MonthlyIncome lang={lang} region={region} />
			<ExplainerVideo lang={lang} region={region} />
			<MobileIllustration lang={lang} region={region} />
			<FAQ lang={lang} region={region} />
			<Approach lang={lang} region={region} />
			<Quotes lang={lang} region={region} />
			<SDGGoals lang={lang} region={region} />
			<Testimonials lang={lang} region={region} />
		</div>
	);
}
