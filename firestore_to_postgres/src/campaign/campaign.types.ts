import { Prisma } from '@prisma/client';
import { Campaign } from '@socialincome/shared/src/types/campaign';

export type FirestoreCampaignType = Campaign;
export type FirestoreCampaignWithId = FirestoreCampaignType & { id: string };
export type CampaignCreateInput = Prisma.CampaignCreateInput;
