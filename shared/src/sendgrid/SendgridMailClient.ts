import { MailService } from '@sendgrid/mail';
import { Currency } from '../types/currency';

export type FirstPayoutEmailTemplateData = {
	first_name?: string;
	donation_amount: number;
	currency: Currency;
};

export class SendgridMailClient extends MailService {
	constructor(apiKey: string) {
		super();
		this.setApiKey(apiKey);
	}

	sendFirstPayoutEmail = async (email: string, data: FirstPayoutEmailTemplateData) => {
		await this.send({
			to: email,
			from: 'hello@socialincome.org',
			templateId: 'd-4e616d721b0240509f468c1e5ff22e6d',
			dynamicTemplateData: data,
		});
	};
}
