import { LocalPartner } from '@prisma/client';

export type CreateLocalPartnerInput = Omit<LocalPartner, 'id' | 'createdAt' | 'updatedAt'>;
