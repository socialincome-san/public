import { Campaign as PrismaCampaign } from '@prisma/client';
import { PROGRAM1_ID, PROGRAM2_ID, PROGRAM3_ID } from './programs';

const START = 1;
const END = 9;

const makeCampaign = (i: number, programId: string): PrismaCampaign => ({
	id: `campaign-${i}`,
	title: `Campaign ${i}`,
	description: `Description for Campaign ${i}`,
	secondDescriptionTitle: null,
	secondDescription: null,
	thirdDescriptionTitle: null,
	thirdDescription: null,
	linkWebsite: null,
	linkInstagram: null,
	linkTiktok: null,
	linkFacebook: null,
	linkX: null,
	goal: 1000 + i * 500,
	currency: 'CHF',
	additionalAmountChf: null,
	endDate: new Date(new Date().getTime() + i * 30 * 24 * 60 * 60 * 1000), // staggered future end dates
	isActive: i % 2 === 0,
	public: true,
	featured: false,
	slug: `campaign-${i}`,
	metadataDescription: null,
	metadataOgImage: null,
	metadataTwitterImage: null,
	creatorName: `Creator ${i}`,
	creatorEmail: `creator${i}@example.com`,
	programId,
	createdAt: new Date(),
	updatedAt: null,
});

export const campaignsData: PrismaCampaign[] = [];

const programIds = [PROGRAM1_ID, PROGRAM2_ID, PROGRAM3_ID];

for (let i = START; i <= END; i++) {
	const programId = programIds[i % programIds.length];
	campaignsData.push(makeCampaign(i, programId));
}