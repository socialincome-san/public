export const ORANGE_MONEY_RECIPIENT_FIRESTORE_PATH = 'om-list';

export type OrangeMoneyRecipient = {
	first_name: string;
	last_name: string;
	om_uid: number;
	om_amount: number;
	om_phone_number: number;
	om_remarks: string;
	om_user_type: string;
};
