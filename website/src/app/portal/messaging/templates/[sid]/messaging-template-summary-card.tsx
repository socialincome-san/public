import { SendMessageDialog } from '@/app/portal/messaging/templates/[sid]/send-message-dialog';
import { twilioTemplateUrl } from '@/app/portal/messaging/twilio-console-url';
import type { TwilioTemplateDetail } from '@/modules/messaging/messaging.types';
import { RecordSummary } from '@socialincome/design-system/data-display/record-summary/record-summary';

type MessagingTemplateSummaryCardProps = {
	template: TwilioTemplateDetail;
	twilioAccountSid: string | null;
};

export const MessagingTemplateSummaryCard = ({ template, twilioAccountSid }: MessagingTemplateSummaryCardProps) => (
	<RecordSummary
		title={template.friendlyName}
		identifier={template.sid}
		externalLink={
			twilioAccountSid ? { href: twilioTemplateUrl(twilioAccountSid, template.sid), label: 'View in Twilio' } : undefined
		}
		aside={<SendMessageDialog template={template} />}
		columns={4}
		fields={[
			{ label: 'Language', value: template.language },
			{ label: 'Content type', value: template.contentType ?? '—' },
			{ label: 'Variables', value: template.variables.length },
			{ label: 'Supported channels', badges: template.supportedChannels },
		]}
		section={{
			title: 'Message body',
			content: template.body ? (
				<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{template.body}</pre>
			) : (
				<p className="text-muted-foreground text-sm">(no body)</p>
			),
		}}
	/>
);
