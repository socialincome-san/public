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
	listId = '';
	suppressionListId = 0; // unsubscribe group id
	private initialized = false;

	protected resultOk<T>(data: T, status?: number): ServiceResult<T> {
		return { success: true, data, status };
	}

	protected resultFail<T = never>(error: string, status?: number): ServiceResult<T> {
		return { success: false, error, status };
	}

	constructor() {
		super();
	}

	getActiveSubscription = async (
		contributor: ContributorSession,
	): Promise<ServiceResult<SendgridContactType | null>> => {
		try {
			const configResult = this.ensureConfigured();
			if (!configResult.success) {
				return configResult;
			}
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
			const configResult = this.ensureConfigured();
			if (!configResult.success) {
				return configResult;
			}
			await this.upsertSubscription({ ...subscription, status: 'subscribed' });
			return this.resultOk(undefined);
		} catch (error) {
			return this.resultFail(`Unable to subscribe to newsletter: ${JSON.stringify(error)}`);
		}
	};

	unsubscribeFromNewsletter = async (contributor: ContributorSession): Promise<ServiceResult<void>> => {
		try {
			const configResult = this.ensureConfigured();
			if (!configResult.success) {
				return configResult;
			}
			if (!contributor.email) {
				return this.resultFail('Email missing contributor');
			}
			await this.upsertSubscription({
				firstname: contributor.firstName || '',
				lastname: contributor.lastName || '',
				email: contributor.email,
				status: 'unsubscribed',
				language: (contributor.language || 'de') as SupportedLanguage,
				country: contributor.country || 'CH',
			});
			return this.resultOk(undefined);
		} catch (error) {
			return this.resultFail(`Unable to unsubscribe from newsletter: ${JSON.stringify(error)}`);
		}
	};

	private ensureConfigured(): ServiceResult<void> {
		if (this.initialized) {
			return this.resultOk(undefined);
		}

		const envResult = this.validateSendgridEnvVars();
		if (!envResult.success) {
			return envResult;
		}

		this.setApiKey(envResult.data.SENDGRID_API_KEY);
		this.listId = envResult.data.SENDGRID_LIST_ID;
		this.suppressionListId = envResult.data.SENDGRID_SUPPRESSION_LIST_ID;
		this.initialized = true;
		return this.resultOk(undefined);
	}

	private validateSendgridEnvVars = (): ServiceResult<SendgridClientProps> => {
		const suppressionListIdRaw = process.env.SENDGRID_SUPPRESSION_LIST_ID;
		const sendgridApiKey = process.env.SENDGRID_API_KEY;
		const sendgridListId = process.env.SENDGRID_LIST_ID;

		if (!suppressionListIdRaw || !sendgridApiKey || !sendgridListId) {
			return this.resultFail('Missing required Sendgrid environment variables');
		}

		const suppressionListId = parseInt(suppressionListIdRaw, 10);
		if (isNaN(suppressionListId)) {
			return this.resultFail('SENDGRID_SUPPRESSION_LIST_ID must be a valid number');
		}

		const sendgridClientProps: SendgridClientProps = {
			SENDGRID_API_KEY: sendgridApiKey,
			SENDGRID_LIST_ID: sendgridListId,
			SENDGRID_SUPPRESSION_LIST_ID: suppressionListId,
		};
		return this.resultOk(sendgridClientProps);
	};

	private getContact = async (email: string): Promise<SendgridContactType | null> => {
		try {
			const [, body] = await this.request({
				method: 'POST',
				url: '/v3/marketing/contacts/search/emails',
				body: { emails: [email] },
			});
			const searchResponse = body as { result: Record<string, { contact: SendgridContactType }> };
			const contact = searchResponse.result[email]?.contact;
			if (!contact) {
				return null;
			}
			const isSuppressed = await this.isSuppressed(email);
			return { ...contact, status: isSuppressed ? 'unsubscribed' : 'subscribed' } as SendgridContactType;
		} catch (e: unknown) {
			if ((e as { code?: number })?.code !== 404) {
				console.error('Unable to get contact', e);
			}
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
		const [, body] = await this.request({ url: `/v3/asm/suppressions/${email}`, method: 'GET' });
		const suppressions = (body as { suppressions?: Suppression[] }).suppressions ?? [];
		return suppressions.some(
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
