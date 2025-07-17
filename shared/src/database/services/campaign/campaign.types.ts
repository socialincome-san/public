import { Campaign as PrismaCampaign } from '@prisma/client';

export type CreateCampaignInput = Omit<PrismaCampaign, 'id' | 'createdAt' | 'updatedAt'>;
