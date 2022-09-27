// This exposes a view of Recipient as Orange Money Payment List.
// first_name, last_name, om_uid and om_phone_number are auto-updated from Recipient.
// om_amount, om_user_type and om_remarks are updated by a monthly cron job
export type OrangeMoneyList = {
	first_name: string;
	last_name: string;
	om_uid: number;
	om_amount: number;
	om_phone_number: number;
	om_remarks: string;
	om_user_type: string;
};
