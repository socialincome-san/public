export type Suppression = {
	name: string;
	id: number;
	description: string;
	is_default: boolean;
	suppressed: boolean;
};

export type SendgridContactType = {
	address_line_1?: string;
	address_line_2?: string;
	alternate_emails: string[];
	city?: string;
	country?: string;
	email: string;
	first_name?: string;
	id?: string;
	last_name?: string;
	list_ids: string[];
	postal_code?: string;
	state_province_region?: string;
	phone_number?: string;
	whatsapp?: string;
	line?: string;
	facebook?: string;
	unique_name?: string;
	_metadata: any[];
	custom_fields: {
		language: string;
		is_contributor: string;
	};
	created_at: string;
	updated_at: string;
	status?: 'subscribed' | 'unsubscribed';
};
