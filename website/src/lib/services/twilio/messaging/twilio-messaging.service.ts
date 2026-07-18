import { ServiceResult } from '../../core/base.types';
import { TwilioBaseService } from '../twilio-base.service';
import { parseTemplateVariables } from './parse-template-variables';
import { ContentTemplateDetail, ContentTemplateSummary } from './twilio-messaging.types';

export class TwilioMessagingService extends TwilioBaseService {
	async listContentTemplates(): Promise<ServiceResult<ContentTemplateSummary[]>> {
		try {
			const twilioClientResult = this.getTwilioClient();
			if (!twilioClientResult.success) {
				return twilioClientResult;
			}

			const templates = await twilioClientResult.data.content.v1.contentAndApprovals.list();

			const summaries: ContentTemplateSummary[] = templates.map((template) => {
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
			});

			return this.resultOk(summaries);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to list Twilio content templates: ${JSON.stringify(error)}`);
		}
	}

	async getContentTemplate(sid: string): Promise<ServiceResult<ContentTemplateDetail>> {
		try {
			const twilioClientResult = this.getTwilioClient();
			if (!twilioClientResult.success) {
				return twilioClientResult;
			}

			const template = await twilioClientResult.data.content.v1.contents(sid).fetch();

			const contentType = Object.keys(template.types ?? {})[0] ?? null;
			const body = (Object.values(template.types ?? {})[0] as { body?: string } | undefined)?.body ?? null;
			const examples = (template.variables ?? {}) as Record<string, unknown>;

			return this.resultOk({
				sid: template.sid,
				friendlyName: template.friendlyName,
				language: template.language,
				contentType,
				body,
				variables: parseTemplateVariables(body, examples),
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch Twilio content template: ${JSON.stringify(error)}`);
		}
	}
}
