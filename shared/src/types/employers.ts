import { Timestamp } from 'firebase-admin/firestore';
import { DocumentReference } from 'firebase-admin/firestore';
import { User } from './user';

export const EMPLOYERS_FIRESTORE_PATH = 'employers';

export type Employer = {
	userId: DocumentReference;
	isCurrent: boolean;
	employerName: string;
	created: Timestamp;
};
