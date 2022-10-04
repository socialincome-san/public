export const CONTRIBUTION_FIRESTORE_PATH = 'contributions';

export type Contribution = {
	source: string;
	created: Date;
	amount: number;
	currency: string;
	amount_net_chf: number;
	reference_id: string; // e.g stripe charge id
};
