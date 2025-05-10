import { Timestamp } from 'firebase-admin/firestore';
import functions from 'firebase-functions-test';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { getOrInitializeFirebaseAdmin } from '../../firebase/admin/app';
import { Campaign, CAMPAIGN_FIRESTORE_PATH, CampaignStatus } from '../../types/campaign';
import {
	Contribution,
	CONTRIBUTION_FIRESTORE_PATH,
	ContributionSourceKey,
	StatusKey,
	StripeContribution,
} from '../../types/contribution';
import { CampaignStatsCalculator } from './CampaignStatsCalculator';

const projectId = 'campaign-stats-calculator-test';
const testEnv = functions({ projectId });
const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId }));

let calculator: CampaignStatsCalculator;

const now = Timestamp.now();
const futureDate = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)); // +7 days
const pastDate = Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)); // -7 days

const campaign1: Campaign = {
	creator_name: 'Alice',
	email: 'alice@example.com',
	title: 'Campaign One',
	description: 'First campaign',
	status: CampaignStatus.Active,
	featured: true,
	end_date: futureDate,
};

const campaign2: Campaign = {
	creator_name: 'Bob',
	email: 'bob@example.com',
	title: 'Campaign Two',
	description: 'Second campaign',
	status: CampaignStatus.Active,
	featured: false,
	end_date: futureDate,
};

const campaign3: Campaign = {
	creator_name: 'Charlie',
	email: 'charlie@example.com',
	title: 'Campaign Three',
	description: 'Third campaign',
	status: CampaignStatus.Active,
	featured: true,
	end_date: pastDate,
};

let campaign1RefId: string;
let campaign2RefId: string;
let campaign3RefId: string;

beforeAll(async () => {
	await testEnv.firestore.clearFirestoreData({ projectId });

	// Add campaigns
	const campaign1Ref = await firestoreAdmin.collection<Campaign>(CAMPAIGN_FIRESTORE_PATH).add(campaign1);
	const campaign2Ref = await firestoreAdmin.collection<Campaign>(CAMPAIGN_FIRESTORE_PATH).add(campaign2);
	const campaign3Ref = await firestoreAdmin.collection<Campaign>(CAMPAIGN_FIRESTORE_PATH).add(campaign3);

	campaign1RefId = campaign1Ref.id;
	campaign2RefId = campaign2Ref.id;
	campaign3RefId = campaign3Ref.id;

	const contribution1: StripeContribution = {
		source: ContributionSourceKey.STRIPE,
		status: StatusKey.SUCCEEDED,
		created: now,
		amount: 100,
		amount_chf: 90,
		fees_chf: 10,
		currency: 'CHF',
		campaign_path: campaign1Ref,
		monthly_interval: 1,
		reference_id: 'stripe_001',
	};

	const contribution2: StripeContribution = {
		source: ContributionSourceKey.STRIPE,
		status: StatusKey.SUCCEEDED,
		created: now,
		amount: 200,
		amount_chf: 180,
		fees_chf: 20,
		currency: 'CHF',
		campaign_path: campaign1Ref,
		monthly_interval: 1,
		reference_id: 'stripe_002',
	};

	const contribution3: StripeContribution = {
		source: ContributionSourceKey.STRIPE,
		status: StatusKey.SUCCEEDED,
		created: now,
		amount: 150,
		amount_chf: 140,
		fees_chf: 10,
		currency: 'CHF',
		campaign_path: campaign2Ref,
		monthly_interval: 1,
		reference_id: 'stripe_003',
	};

	await firestoreAdmin.collection<Contribution>(CONTRIBUTION_FIRESTORE_PATH).add(contribution1);
	await firestoreAdmin.collection<Contribution>(CONTRIBUTION_FIRESTORE_PATH).add(contribution2);
	await firestoreAdmin.collection<Contribution>(CONTRIBUTION_FIRESTORE_PATH).add(contribution3);

	// Build the calculator
	calculator = await CampaignStatsCalculator.build(firestoreAdmin);
});

test('filters ongoing featured campaigns correctly', async () => {
	const stats = await calculator.allStats();
	const ids = stats.ongoingFeaturedCampaigns.map((doc) => doc.id);

	expect(ids).toContain(campaign1RefId);
	expect(ids).not.toContain(campaign2RefId);
	expect(ids).not.toContain(campaign3RefId);
});

test('maps contributions to the correct campaign', async () => {
	const stats = await calculator.allStats();

	const campaign1Contributions = stats.getContributionsForCampaign(campaign1RefId);
	const campaign2Contributions = stats.getContributionsForCampaign(campaign2RefId);
	const campaign3Contributions = stats.getContributionsForCampaign(campaign3RefId);

	expect(campaign1Contributions).toHaveLength(2);
	expect(campaign2Contributions).toHaveLength(1);
	expect(campaign3Contributions).toHaveLength(0);
});
