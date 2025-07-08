import { Survey as PrismaSurvey } from '@prisma/client';

export type CreateSurveyInput = Omit<PrismaSurvey, 'id' | 'createdAt' | 'updatedAt'>;
