import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { validateRequest } from 'twilio';
import { getTwilioClient } from './twilio-client.integration';

export type TwilioContentSummary = {
	sid: string;
	friendlyName: string;
	language: string;
	contentTypes: string[];
	whatsappStatus: string | null;
	whatsappCategory: string | null;
};

export type TwilioContentDetail = {
	sid: string;
	friendlyName: string;
	language: string;
	content: Record<string, unknown>;
	variables: Record<string, unknown>;
	whatsappStatus: string | null;
};

export type TwilioMessageStatus = {
	status: string;
	errorCode: string | null;
	errorMessage: string | null;
};

export const listTwilioContent = async (): Promise<ServiceResult<TwilioContentSummary[]>> => {
	const clientResult = await getTwilioClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const templates = await clientResult.data.content.v1.contentAndApprovals.list();

		return resultOk(
			templates.map((template) => {
				const approval = readRecord(template.approvalRequests);

				return {
					sid: template.sid,
					friendlyName: template.friendlyName,
					language: template.language,
					contentTypes: Object.keys(template.types ?? {}),
					whatsappStatus: readOptionalString(approval, 'status'),
					whatsappCategory: readOptionalString(approval, 'category'),
				};
			}),
		);
	} catch (error) {
		console.error('Failed to list Twilio content templates', { error });

		return resultFail('Failed to list Twilio content templates');
	}
};

export const getTwilioContent = async (sid: string): Promise<ServiceResult<TwilioContentDetail>> => {
	const clientResult = await getTwilioClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const template = await clientResult.data.content.v1.contents(sid).fetch();
		let whatsappStatus: string | null = null;
		try {
			const approval = await clientResult.data.content.v1.contents(sid).approvalFetch().fetch();
			whatsappStatus = readOptionalString(readRecord(approval.whatsapp), 'status');
		} catch (error) {
			console.warn('Failed to fetch Twilio WhatsApp approval', { sid, error });
		}

		return resultOk({
			sid: template.sid,
			friendlyName: template.friendlyName,
			language: template.language,
			content: readRecord(template.types),
			variables: readRecord(template.variables),
			whatsappStatus,
		});
	} catch (error) {
		console.error('Failed to fetch Twilio content template', { sid, error });

		return resultFail('Failed to fetch Twilio content template');
	}
};

export const sendTwilioContentMessage = async (input: {
	messagingServiceSid: string;
	contentSid: string;
	contentVariables: Record<string, string>;
	to: string;
	statusCallback?: string;
}): Promise<ServiceResult<{ sid: string }>> => {
	const clientResult = await getTwilioClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const message = await clientResult.data.messages.create({
			messagingServiceSid: input.messagingServiceSid,
			contentSid: input.contentSid,
			contentVariables: JSON.stringify(input.contentVariables),
			to: input.to,
			...(input.statusCallback ? { statusCallback: input.statusCallback } : {}),
		});

		return resultOk({ sid: message.sid });
	} catch (error) {
		console.error('Failed to send Twilio content message', { error });

		return resultFail('Twilio message send failed');
	}
};

export const getTwilioMessageStatus = async (sid: string): Promise<ServiceResult<TwilioMessageStatus>> => {
	const clientResult = await getTwilioClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const message = await clientResult.data.messages(sid).fetch();

		return resultOk({
			status: message.status,
			errorCode: message.errorCode === null || message.errorCode === undefined ? null : String(message.errorCode),
			errorMessage: message.errorMessage ?? null,
		});
	} catch (error) {
		console.error('Failed to fetch Twilio message status', { sid, error });

		return resultFail('Failed to fetch Twilio message status');
	}
};

export const validateTwilioWebhook = async (input: {
	signature: string;
	url: string;
	params: Record<string, string>;
}): Promise<ServiceResult<boolean>> => {
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	if (!authToken) {
		return resultFail('Twilio webhook authentication is not configured', 403);
	}

	try {
		const isValid = await Promise.resolve(validateRequest(authToken, input.signature, input.url, input.params));

		return isValid ? resultOk(true) : resultFail('Invalid Twilio webhook signature', 403);
	} catch (error) {
		console.error('Failed to validate Twilio webhook signature', { error });

		return resultFail('Invalid Twilio webhook signature', 403);
	}
};

const readRecord = (value: unknown): Record<string, unknown> => {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return {};
	}

	return Object.fromEntries(Object.entries(value));
};

const readOptionalString = (record: Record<string, unknown>, key: string): string | null => {
	const value = record[key];

	return typeof value === 'string' ? value : null;
};
