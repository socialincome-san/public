import { CountryCode } from '@/lib/types/country';
import { Client } from '@sendgrid/client';
import { ContributorSession } from '../contributor/contributor.types';
import { ServiceResult } from '../core/base.types';
import {
	CreateNewsletterSubscription,
	NewsletterSubscriptionData,
	SendgridClientProps,
	SendgridContactType,
	SupportedLanguage,
	Suppression,
} from './types';

export class SendgridSubscriptionService extends Client {
	listId: string;
	suppressionListId: number; // unsubscribe group id

	protected resultOk<T>(data: T, status?: number): ServiceResult<T> {
		return { success: true, data, status };
	}

	protected resultFail<T = never>(error: string, status?: number): ServiceResult<T> {
		return { success: false, error, status };
	}

	constructor() {
		super();
		const env: SendgridClientProps = this.validateSendgridEnvVars();
		this.setApiKey(env.SENDGRID_API_KEY);
		this.listId = env.SENDGRID_LIST_ID;
		this.suppressionListId = env.SENDGRID_SUPPRESSION_LIST_ID;
	}

	getActiveSubscription = async (
		contributor: ContributorSession,
	): Promise<ServiceResult<SendgridContactType | null>> => {
		try {
			if (!contributor.email) {
				return this.resultFail('Email missing in contributor');
			}
			const subscriber = await this.getContact(contributor.email);
			return this.resultOk(subscriber);
		} catch (error) {
			return this.resultFail(`Unable to get active subscription: ${JSON.stringify(error)}`);
		}
	};

	subscribeToNewsletter = async (subscription: CreateNewsletterSubscription): Promise<ServiceResult<void>> => {
		try {
			await this.upsertSubscription({ ...subscription, status: 'subscribed' });
			return this.resultOk(undefined);
		} catch (error) {
			return this.resultFail(`Unable to subscribe to newsletter: ${JSON.stringify(error)}`);
		}
	};

	unsubscribeFromNewsletter = async (contributor: ContributorSession): Promise<ServiceResult<void>> => {
		try {
			if (!contributor.email) {
				return this.resultFail('Email missing contributor');
			}
			await this.upsertSubscription({
				firstname: contributor.firstName || '',
				lastname: contributor.lastName || '',
				email: contributor.email,
				status: 'unsubscribed',
				language: (contributor.language || 'de') as SupportedLanguage,
				country: (contributor.country || 'CH') as CountryCode,
			});
			return this.resultOk(undefined);
		} catch (error) {
			return this.resultFail(`Unable to unsubscribe from newsletter: ${JSON.stringify(error)}`);
		}
	};

	private validateSendgridEnvVars = (): SendgridClientProps => {
		const suppressionListId = parseInt(process.env.SENDGRID_SUPPRESSION_LIST_ID!);
		if (isNaN(suppressionListId)) {
			throw new Error('SENDGRID_SUPPRESSION_LIST_ID must be a valid number');
		}

		const sendgridClientProps: SendgridClientProps = {
			SENDGRID_API_KEY: process.env.SENDGRID_API_KEY!,
			SENDGRID_LIST_ID: process.env.SENDGRID_LIST_ID!,
			SENDGRID_SUPPRESSION_LIST_ID: suppressionListId,
		};

		Object.entries(sendgridClientProps).forEach(([key, value]) => {
			if (!value) throw new Error(`Missing required environment variable: ${key}`);
		});
		return sendgridClientProps;
	};

	private getContact = async (email: string): Promise<SendgridContactType | null> => {
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
			if (e.code !== 404) console.error('Unable to get contact', e);
			return null;
		}
	};

	private upsertSubscription = async (data: NewsletterSubscriptionData) => {
		const contact = await this.getContact(data.email);
		if (!contact) {
			await this.addContact(data);
		}

		if (data.status === 'subscribed') {
			await this.removeSuppression(data.email);
		}
		if (data.status === 'unsubscribed') {
			await this.addSuppression(data.email);
		}
	};

	private isSuppressed = async (email: string): Promise<boolean> => {
		const [_, body] = await this.request({ url: `/v3/asm/suppressions/${email}`, method: 'GET' });
		return body.suppressions.some(
			(suppression: Suppression) => suppression.id === this.suppressionListId && suppression.suppressed,
		);
	};

	private removeSuppression = async (email: string) => {
		await this.request({ url: `/v3/asm/groups/${this.suppressionListId}/suppressions/${email}`, method: 'DELETE' });
	};

	/**
	 * Add an email to the unsubscribe list.
	 */
	private addSuppression = async (email: string) => {
		await this.request({
			url: `/v3/asm/groups/${this.suppressionListId}/suppressions`,
			method: 'POST',
			body: { recipient_emails: [email] },
		});
	};

	/**
	 * Add a contact to the global contacts list.
	 */
	private addContact = async (data: NewsletterSubscriptionData) => {
		await this.request({
			url: `/v3/marketing/contacts`,
			method: 'PUT',
			body: {
				list_ids: [this.listId],
				contacts: [
					{
						email: data.email,
						first_name: data.firstname,
						last_name: data.lastname,
						country: data.country,
						custom_fields: { language: data.language, contributor: data.isContributor ? 'yes' : 'no' },
					},
				],
			},
		});
	};
}
