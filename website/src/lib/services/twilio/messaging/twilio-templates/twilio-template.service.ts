import { Twilio } from 'twilio';
import { ServiceResult } from '../../../core/base.types';
import { TwilioBaseService } from '../../twilio-base.service';
import { parseTemplateVariables } from './parse-template-variables';
import { TwilioTemplateDetail, TwilioTemplateSummary } from './twilio-template.types';

// The portal only sends plain-text SMS/WhatsApp, so we surface only `twilio/text`
// templates and hide richer content types (media, quick-reply, list-picker, etc.).
const TEXT_CONTENT_TYPE = 'twilio/text';

export class TwilioTemplateService extends TwilioBaseService {
	async listTwilioTemplates(): Promise<ServiceResult<TwilioTemplateSummary[]>> {
		try {
			const twilioClientResult = this.getTwilioClient();
			if (!twilioClientResult.success) {
				return twilioClientResult;
			}

			const templates = await twilioClientResult.data.content.v1.contentAndApprovals.list();

			const summaries: TwilioTemplateSummary[] = templates
				.map((template) => {
					const contentType = Object.keys(template.types ?? {})[0] ?? null;
					const approval = (template.approvalRequests ?? {}) as { status?: string; category?: string };

					return {
						sid: template.sid,
						friendlyName: template.friendlyName,
						language: template.language,
						contentType,
						whatsappStatus: approval.status ?? null,
						whatsappCategory: approval.category ?? null,
					};
				})
				.filter((summary) => summary.contentType === TEXT_CONTENT_TYPE);

			return this.resultOk(summaries);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to list Twilio content templates: ${this.formatError(error)}`);
		}
	}

	async getTwilioTemplate(sid: string): Promise<ServiceResult<TwilioTemplateDetail>> {
		try {
			const twilioClientResult = this.getTwilioClient();
			if (!twilioClientResult.success) {
				return twilioClientResult;
			}

			const template = await twilioClientResult.data.content.v1.contents(sid).fetch();

			const contentType = Object.keys(template.types ?? {})[0] ?? null;
			const body = (Object.values(template.types ?? {})[0] as { body?: string } | undefined)?.body ?? null;
			const examples = (template.variables ?? {}) as Record<string, unknown>;
			const whatsappStatus = await this.fetchWhatsappApprovalStatus(twilioClientResult.data, sid);

			return this.resultOk({
				sid: template.sid,
				friendlyName: template.friendlyName,
				language: template.language,
				contentType,
				body,
				variables: parseTemplateVariables(body, examples),
				// SMS is always available; WhatsApp only once the template is WhatsApp-approved.
				supportedChannels: whatsappStatus === 'approved' ? ['sms', 'whatsapp'] : ['sms'],
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch Twilio content template: ${this.formatError(error)}`);
		}
	}

	// Templates never submitted to WhatsApp make approvalFetch throw/404, so a failed
	// lookup degrades to "no approval" (SMS-only) rather than failing the whole fetch.
	private async fetchWhatsappApprovalStatus(twilioClient: Twilio, sid: string): Promise<string | null> {
		try {
			const approval = await twilioClient.content.v1.contents(sid).approvalFetch().fetch();
			const whatsapp = (approval.whatsapp ?? {}) as { status?: string };

			return whatsapp.status ?? null;
		} catch (error) {
			this.logger.warn(`Failed to fetch WhatsApp approval for template ${sid}: ${this.formatError(error)}`);

			return null;
		}
	}
}
