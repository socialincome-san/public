import { SendMessageDialog } from '@/app/portal/messaging/templates/[sid]/send-message-dialog';
import { twilioTemplateUrl } from '@/app/portal/messaging/twilio-console-url';
import type { TwilioTemplateDetail } from '@/modules/messaging/messaging.types';
import { RecordSummary } from '@socialincome/design-system/data-display/record-summary/record-summary';
import { getTranslations } from 'next-intl/server';

type MessagingTemplateSummaryCardProps = {
	template: TwilioTemplateDetail;
	twilioAccountSid: string | null;
};

export const MessagingTemplateSummaryCard = async ({ template, twilioAccountSid }: MessagingTemplateSummaryCardProps) => {
	const t = await getTranslations('portal-messaging');

	return (
		<RecordSummary
			title={template.friendlyName}
			identifier={template.sid}
			externalLink={
				twilioAccountSid
					? { href: twilioTemplateUrl(twilioAccountSid, template.sid), label: t('common.viewInTwilio') }
					: undefined
			}
			aside={<SendMessageDialog template={template} />}
			columns={4}
			fields={[
				{ label: t('templates.columns.language'), value: template.language },
				{ label: t('templates.summary.contentType'), value: template.contentType ?? '—' },
				{ label: t('templates.summary.variables'), value: template.variables.length },
				{
					label: t('templates.summary.supportedChannels'),
					badges: template.supportedChannels.map((channel) =>
						channel === 'sms' ? t('common.channels.sms') : t('common.channels.whatsapp'),
					),
				},
			]}
			section={{
				title: t('templates.summary.messageBody'),
				content: template.body ? (
					<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{template.body}</pre>
				) : (
					<p className="text-muted-foreground text-sm">{t('common.noBody')}</p>
				),
			}}
		/>
	);
};
