import mailchimp, { Status } from '@mailchimp/mailchimp_marketing';

export type MailchimpSubscriptionData = {
	email: string;
	status: Status;
	language?: string;
	firstname?: string;
	lastname?: string;
	country?: string;
};

export class MailchimpAPI {
	constructor(apiKey: string, server: string) {
		mailchimp.setConfig({
			apiKey: apiKey,
			server: server,
		});
	}

	getSubscriber = async (email: string, listId: string) => {
		try {
			return await mailchimp.lists.getListMember(listId, this.md5(email.toLowerCase()));
		} catch (error) {
			return null;
		}
	};

	updateSubscription = async (data: MailchimpSubscriptionData, listId: string) => {
		await mailchimp.lists.updateListMember(listId, this.md5(data.email), {
			email_address: data.email,
			status: data.status,
			merge_fields: {
				FNAME: data.firstname ?? '',
				LNAME: data.lastname ?? '',
				COUNTRY: data.country ?? '',
				LANGUAGE: data.language,
			},
		});
	};

	createSubscription = async (data: MailchimpSubscriptionData, listId: string) => {
		await mailchimp.lists.addListMember(listId, {
				email_address: data.email,
				status: data.status,
				merge_fields: {
					FNAME: data.firstname ?? '',
					LNAME: data.lastname ?? '',
					COUNTRY: data.country ?? '',
					LANGUAGE: data.language,
				},
			});	

	};			

	// Helper function to calculate the MD5 hash
	md5 = (str: string): string => {
		const crypto = require('crypto');
		return crypto.createHash('md5').update(str).digest('hex');
	};
}
