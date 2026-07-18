import { MessagingTemplateBuilder } from '@/app/portal/messaging/templates/[sid]/messaging-template-builder';
import type { ContentTemplateDetail } from '@/lib/services/twilio/messaging/twilio-messaging.types';
import Link from 'next/link';

type Props = {
	template: ContentTemplateDetail;
};

export const MessagingTemplateDetail = ({ template }: Props) => {
	return (
		<div className="space-y-8">
			<Link href="/portal/messaging/overview" className="text-muted-foreground hover:text-foreground text-sm">
				← Back to overview
			</Link>

			<div className="space-y-1">
				<h2 className="text-2xl font-medium">{template.friendlyName}</h2>
				<p className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
					<span className="font-mono">{template.sid}</span>
					<span>{template.language}</span>
					<span>{template.contentType ?? '—'}</span>
				</p>
			</div>

			<section className="space-y-2">
				<h3 className="text-sm font-medium">Body</h3>
				{template.body ? (
					<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{template.body}</pre>
				) : (
					<p className="text-muted-foreground text-sm">(no body)</p>
				)}
			</section>

			<MessagingTemplateBuilder template={template} />
		</div>
	);
};
