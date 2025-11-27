import { Prisma } from '@prisma/client';
import { Recipient } from '@socialincome/shared/src/types/recipient';
import { Survey } from '@socialincome/shared/src/types/survey';

export const SURVEY_FIRESTORE_PATH = 'surveys';
export const RECIPIENT_FIRESTORE_PATH = 'recipients';

export type FirestoreRecipientWithId = Recipient & { id: string; legacyFirestoreId: string };
export type FirestoreSurveyWithRecipient = {
	survey: Survey & { id: string; legacyFirestoreId: string };
	recipient: FirestoreRecipientWithId;
};

export type SurveyCreateInput = Prisma.SurveyCreateInput;
