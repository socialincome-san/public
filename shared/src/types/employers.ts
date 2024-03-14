import { Timestamp } from 'firebase-admin/firestore';

export const EMPLOYERS_FIRESTORE_PATH = 'employers';

export type Employer = {
	is_current: boolean;
	employer_name: string;
	created: Timestamp;
};
