import { QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { Campaign, CAMPAIGN_FIRESTORE_PATH, CampaignStatus } from '../../types/campaign';
import { Contribution, CONTRIBUTION_FIRESTORE_PATH } from '../../types/contribution';

export interface CampaignStats {
	ongoingFeaturedCampaigns: QueryDocumentSnapshot<Campaign>[];
	getContributionsForCampaign: (campaignId: string) => Contribution[];
}

export class CampaignStatsCalculator {
	private contributionsByCampaignId: Map<string, Contribution[]> = new Map();

	constructor(private readonly campaigns: QueryDocumentSnapshot<Campaign>[]) {}

	/**
	 * Builds the calculator by loading all campaigns and pre-fetching contributions.
	 */
	static async build(firestoreAdmin: FirestoreAdmin): Promise<CampaignStatsCalculator> {
		const campaignDocs = await firestoreAdmin.collection<Campaign>(CAMPAIGN_FIRESTORE_PATH).get();
		const calculator = new CampaignStatsCalculator(campaignDocs.docs);
		const contributionDocs = await firestoreAdmin.collectionGroup<Contribution>(CONTRIBUTION_FIRESTORE_PATH).get();

		for (const doc of contributionDocs.docs) {
			const data = doc.data();
			const campaignPath = data.campaign_path;
			const campaignId = campaignPath?.id || null;
			if (!campaignId) continue;
			if (!calculator.contributionsByCampaignId.has(campaignId)) {
				calculator.contributionsByCampaignId.set(campaignId, []);
			}
			calculator.contributionsByCampaignId.get(campaignId)!.push({ ...data });
		}

		return calculator;
	}

	/**
	 * Filters ongoing & featured campaigns (Active, featured, future end_date).
	 */
	private getFilteredCampaigns(): QueryDocumentSnapshot<Campaign>[] {
		const now = Timestamp.now();
		return this.campaigns.filter(
			(c) => c.get('status') === CampaignStatus.Active && c.get('featured') === true && c.get('end_date') > now,
		);
	}

	/**
	 * Returns contributions for a given campaign ID.
	 */
	private getContributionsForCampaign = (campaignId: string): Contribution[] => {
		return this.contributionsByCampaignId.get(campaignId) ?? [];
	};

	/**
	 * Returns filtered campaigns and exposes a method to access contributions.
	 */
	allStats(): CampaignStats {
		return {
			ongoingFeaturedCampaigns: this.getFilteredCampaigns(),
			getContributionsForCampaign: this.getContributionsForCampaign,
		};
	}
}
