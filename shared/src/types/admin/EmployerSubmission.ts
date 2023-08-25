import { Timestamp } from '@google-cloud/firestore';

export const CONTRIBUTION_FIRESTORE_PATH = 'employers-submission';

// defines the identifiers used in the firestore collection
export enum SubmissionType {
	MANUAL = 'manual',
	EXTERNAL_DATA_SOURCE = 'external_data_source',
}

export enum SubmissionSource {
	MANUAL = 'manual',
	ZEFIX = 'zefix',
}

export type EmployerSubmission = {
	submission_date: Timestamp; 
	contributor: string;
	name: string,
	submission_type: {
		type: SubmissionType;
		source: SubmissionSource;
		matching_id?:string;
	};
}
