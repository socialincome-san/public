import { SendMessageDialog } from '@/app/portal/messaging/templates/[sid]/send-message-dialog';
import { Badge } from '@/components/badge';
import { twilioTemplateUrl } from '@/lib/services/twilio/messaging/twilio-console-urls';
import type { TwilioTemplateDetail } from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';
import { ExternalLink } from 'lucide-react';

type MessagingTemplateSummaryCardProps = {
	template: TwilioTemplateDetail;
	twilioAccountSid: string | null;
};

export const MessagingTemplateSummaryCard = ({ template, twilioAccountSid }: MessagingTemplateSummaryCardProps) => {
	return (
		<section className="space-y-6">
			<header className="flex items-start justify-between gap-4">
				<div className="min-w-0 space-y-1.5">
					<h2 className="text-xl font-semibold tracking-tight">{template.friendlyName}</h2>
					<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
						<span className="font-mono">{template.sid}</span>
						{twilioAccountSid && (
							<a
								href={twilioTemplateUrl(twilioAccountSid, template.sid)}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
							>
								View in Twilio
								<ExternalLink className="h-3 w-3" />
							</a>
						)}
					</div>
				</div>
				<SendMessageDialog template={template} />
			</header>

			<dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-4">
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Language</dt>
					<dd className="text-sm">{template.language}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Content type</dt>
					<dd className="text-sm">{template.contentType ?? '—'}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Variables</dt>
					<dd className="text-sm">{template.variables.length}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Supported channels</dt>
					<dd className="flex flex-wrap gap-1">
						{template.supportedChannels.length > 0 ? (
							template.supportedChannels.map((channel) => (
								<Badge key={channel} variant="default" className="uppercase">
									{channel}
								</Badge>
							))
						) : (
							<span className="text-sm">—</span>
						)}
					</dd>
				</div>
			</dl>

			<div className="space-y-2 border-t pt-6">
				<h3 className="text-muted-foreground text-xs">Message body</h3>
				{template.body ? (
					<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{template.body}</pre>
				) : (
					<p className="text-muted-foreground text-sm">(no body)</p>
				)}
			</div>
		</section>
	);
};
