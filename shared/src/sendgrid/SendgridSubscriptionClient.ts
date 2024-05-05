import { Client } from '@sendgrid/client';
import { SendgridContactType } from '@socialincome/shared/src/sendgrid/types';
import { CountryCode } from '../types/country';
import { Suppression } from './types';

export type NewsletterSubscriptionData = {
	email: string;
	status: 'subscribed' | 'unsubscribed';
	language?: 'de' | 'en';
	firstname?: string;
	lastname?: string;
	country?: CountryCode;
	source?: 'contributor' | 'subscriber';
};

export type SendgridSubscriptionClientProps = {
	apiKey: string;
	listId: string;
	suppressionListId: number;
};

export class SendgridSubscriptionClient extends Client {
	listId: string;
	suppressionListId: number; // unsubscribe group id

	constructor(sendgridClientProps: SendgridSubscriptionClientProps) {
		super();
		this.setApiKey(sendgridClientProps.apiKey);
		this.listId = sendgridClientProps.listId;
		this.suppressionListId = sendgridClientProps.suppressionListId;
	}

	getContact = async (email: string): Promise<SendgridContactType | null> => {
		try {
			const [, body] = await this.request({
				method: 'POST',
				url: '/v3/marketing/contacts/search/emails',
				body: { emails: [email] },
			});
			const contact = body.result[email].contact as SendgridContactType;
			const isSuppressed = await this.isSuppressed(email);
			return { ...contact, status: isSuppressed ? 'unsubscribed' : 'subscribed' } as SendgridContactType;
		} catch (e: any) {
			if (e.code === 404) return null;
			throw e;
		}
	};

	upsertSubscription = async (data: NewsletterSubscriptionData) => {
		const contact = await this.getContact(data.email);
		if (!contact) {
			await this.addContact(data);
		}

		if (data.status === 'subscribed') {
			await this.removeSuppression(data.email);
		} else {
			await this.addSuppression(data.email);
		}
	};

	isSuppressed = async (email: string): Promise<boolean> => {
		const [_, body] = await this.request({ url: `/v3/asm/suppressions/${email}`, method: 'GET' });
		return body.suppressions.some(
			(suppression: Suppression) => suppression.id === this.suppressionListId && suppression.suppressed,
		);
	};

	removeSuppression = async (email: string) => {
		await this.request({ url: `/v3/asm/groups/${this.suppressionListId}/suppressions/${email}`, method: 'DELETE' });
	};

	addSuppression = async (email: string) => {
		await this.request({
			url: `/v3/asm/groups/${this.suppressionListId}/suppressions`,
			method: 'POST',
			body: { recipient_emails: [email] },
		});
	};

	addContact = async (data: NewsletterSubscriptionData) => {
		await this.request({
			url: `/v3/marketing/contacts`,
			method: 'PUT',
			body: {
				list_ids: [this.listId],
				contacts: [
					{
						email: data.email,
						first_name: data.firstname ?? '',
						last_name: data.lastname ?? '',
						country: data.country ?? '',
						custom_fields: {
							language: data.language ?? 'en',
							source: data.source ?? 'subscriber',
						},
					},
				],
			},
		});
	};
}
