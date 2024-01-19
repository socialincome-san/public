import { Timestamp } from 'firebase-admin/firestore';

export const EMPLOYERS_FIRESTORE_PATH = 'employers';

export type Employer = {
	userId: string;
	isCurrent: boolean;
	employerName: string;
	created: Timestamp;
};
