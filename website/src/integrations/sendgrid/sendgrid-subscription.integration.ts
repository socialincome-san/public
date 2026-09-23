import { CountryCode } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { Client } from '@sendgrid/client';

type NewsletterLanguage = 'de' | 'en' | 'fr' | 'it';

export type SendgridNewsletterContact = {
	email: string;
	status: 'subscribed' | 'unsubscribed';
};

export type SendgridNewsletterUpsertInput = {
	firstname?: string;
	lastname?: string;
	email: string;
	language: NewsletterLanguage;
	country?: CountryCode;
	status: 'subscribed' | 'unsubscribed';
	isContributor?: boolean;
};

export const searchSendgridNewsletterContact = async (
	email: string,
): Promise<ServiceResult<SendgridNewsletterContact | null>> => {
	const configResult = getSendgridConfig();
	if (!configResult.success) {
		return resultFail(configResult.error);
	}

	try {
		const contact = await findContact(configResult.data, email);

		return resultOk(contact);
	} catch (error) {
		console.error('Could not get SendGrid newsletter contact', { email, error });

		return resultFail('Could not get newsletter subscription');
	}
};

export const upsertSendgridNewsletterSubscription = async (
	input: SendgridNewsletterUpsertInput,
): Promise<ServiceResult<void>> => {
	const configResult = getSendgridConfig();
	if (!configResult.success) {
		return resultFail(configResult.error);
	}

	try {
		const contact = await findContact(configResult.data, input.email);
		if (!contact) {
			await addContact(configResult.data, input);
		}

		if (input.status === 'subscribed') {
			await removeSuppression(configResult.data, input.email);
		}
		if (input.status === 'unsubscribed') {
			await addSuppression(configResult.data, input.email);
		}

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not update SendGrid newsletter subscription', { email: input.email, error });

		return resultFail('Could not update newsletter subscription');
	}
};

type SendgridConfig = {
	client: Client;
	listId: string;
	suppressionListId: number;
};

const getSendgridConfig = (): ServiceResult<SendgridConfig> => {
	const apiKey = process.env.SENDGRID_API_KEY?.trim();
	const listId = process.env.SENDGRID_LIST_ID?.trim();
	const suppressionListIdRaw = process.env.SENDGRID_SUPPRESSION_LIST_ID?.trim();
	if (!apiKey || !listId || !suppressionListIdRaw) {
		return resultFail('Missing required Sendgrid environment variables');
	}

	const suppressionListId = Number.parseInt(suppressionListIdRaw, 10);
	if (!Number.isFinite(suppressionListId)) {
		return resultFail('SENDGRID_SUPPRESSION_LIST_ID must be a valid number');
	}

	const client = new Client();
	client.setApiKey(apiKey);

	return resultOk({ client, listId, suppressionListId });
};

const findContact = async (config: SendgridConfig, email: string): Promise<SendgridNewsletterContact | null> => {
	try {
		const response = await config.client.request({
			method: 'POST',
			url: '/v3/marketing/contacts/search/emails',
			body: { emails: [email] },
		});
		const contact = readSearchContact(getRequestBody(response), email);
		if (!contact) {
			return null;
		}

		const suppressed = await isSuppressed(config, email);

		return { email: contact.email, status: suppressed ? 'unsubscribed' : 'subscribed' };
	} catch (error) {
		if (isSendgridNotFoundError(error)) {
			return null;
		}

		throw error;
	}
};

const addContact = async (config: SendgridConfig, input: SendgridNewsletterUpsertInput) => {
	await config.client.request({
		method: 'PUT',
		url: '/v3/marketing/contacts',
		body: {
			list_ids: [config.listId],
			contacts: [
				{
					email: input.email,
					first_name: input.firstname,
					last_name: input.lastname,
					country: input.country,
					custom_fields: { language: input.language, contributor: input.isContributor ? 'yes' : 'no' },
				},
			],
		},
	});
};

const isSuppressed = async (config: SendgridConfig, email: string): Promise<boolean> => {
	const response = await config.client.request({
		method: 'GET',
		url: `/v3/asm/suppressions/${email}`,
	});
	const suppressions = readSuppressions(getRequestBody(response));

	return suppressions.some((suppression) => suppression.id === config.suppressionListId && suppression.suppressed);
};

const removeSuppression = async (config: SendgridConfig, email: string) => {
	await config.client.request({
		method: 'DELETE',
		url: `/v3/asm/groups/${config.suppressionListId}/suppressions/${email}`,
	});
};

const addSuppression = async (config: SendgridConfig, email: string) => {
	await config.client.request({
		method: 'POST',
		url: `/v3/asm/groups/${config.suppressionListId}/suppressions`,
		body: { recipient_emails: [email] },
	});
};

const getRequestBody = (response: unknown): unknown => {
	if (!Array.isArray(response)) {
		return undefined;
	}

	return response[1];
};

const readSearchContact = (body: unknown, email: string): { email: string } | null => {
	if (!isRecord(body) || !isRecord(body.result)) {
		return null;
	}

	const entry = body.result[email];
	if (!isRecord(entry) || !isRecord(entry.contact) || typeof entry.contact.email !== 'string') {
		return null;
	}

	return { email: entry.contact.email };
};

const readSuppressions = (body: unknown): { id: number; suppressed: boolean }[] => {
	if (!isRecord(body) || !Array.isArray(body.suppressions)) {
		return [];
	}

	return body.suppressions.flatMap((value) => {
		if (!isRecord(value) || typeof value.id !== 'number' || typeof value.suppressed !== 'boolean') {
			return [];
		}

		return [{ id: value.id, suppressed: value.suppressed }];
	});
};

const isSendgridNotFoundError = (error: unknown): boolean => isRecord(error) && error.code === 404;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
