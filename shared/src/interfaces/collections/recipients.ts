import { EntityReference } from '../entityReference';

export type Recipient = {
	birth_date: Date;
	calling_name: string;
	communication_mobile_phone: {
		equals_mobile_money: boolean;
		phone: number;
		has_whatsapp: boolean;
	};
	email: string;
	first_name: string;
	gender: string;
	updated_on: Date;
	im_link: string;
	im_uid: string;
	is_suspended: boolean;
	insta_handle: string;
	last_name: string;
	main_language: string;
	mobile_money_phone: {
		phone: number;
		has_whatsapp: boolean;
	};
	organisation: EntityReference;
	om_uid: number;
	profession: string;
	progr_status: 'active' | 'waitlisted' | 'designated' | 'former';
	si_start_date: Date; //for NGO disabled
	speaks_english: boolean;
	test_recipient: boolean;
	twitter_handle: string;
	im_link_initial: string;
	im_link_regular: string;
};
