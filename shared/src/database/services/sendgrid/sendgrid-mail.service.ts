import { MailService } from '@sendgrid/mail';
import { Currency } from '../../../types/currency';
import { LanguageCode } from '../../../types/language';

export type FirstPayoutEmailTemplateData = {
	first_name?: string;
	donation_amount: number;
	currency: Currency;
	n_days_ago: number;
	donation_amount_sm: number;
	donation_amount_md: number;
	one_time_donation: boolean;
};

export class SendgridMailService extends MailService {
	constructor(apiKey: string) {
		super();
		this.setApiKey(apiKey);
	}

	sendFirstPayoutEmail = async (email: string, language: LanguageCode, data: FirstPayoutEmailTemplateData) => {
		let templateId;
		if (language === 'de') {
			templateId = 'd-3146eb9ee2054b28b22376113eb96ca9';
		} else {
			templateId = 'd-4e616d721b0240509f468c1e5ff22e6d';
		}
		await this.send({
			to: email,
			from: { name: 'Aurélie Schmiedlin', email: 'auerlie@socialincome.org' },
			templateId,
			dynamicTemplateData: data,
		});
	};
}
