'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { Label } from '@/components/label';
import { MessageChannel, MessageRecipientType } from '@/generated/prisma/enums';
import { sendMessagesAction, sendToContactsAction } from '@/lib/server-actions/messaging-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { MessageBatchResult } from '@/lib/services/messaging/messaging.types';
import { useState, useTransition } from 'react';

type RecipientTarget = {
	kind: 'recipients';
	recipientType: MessageRecipientType;
	recipientIds: string[];
};

type FreetextTarget = {
	kind: 'freetext';
	contacts: string[];
};

type MessageTarget = RecipientTarget | FreetextTarget;

type StepConfirmSendProps = {
	channel: MessageChannel;
	target: MessageTarget;
	templateId: string | undefined;
	freeTextBody: string;
	freeTextSubject: string;
	onComplete: () => void;
};

export default function StepConfirmSend({
	channel,
	target,
	templateId,
	freeTextBody,
	freeTextSubject,
	onComplete,
}: StepConfirmSendProps) {
	const [isSending, startTransition] = useTransition();
	const [result, setResult] = useState<MessageBatchResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const count = target.kind === 'recipients' ? target.recipientIds.length : target.contacts.length;

	const handleSend = () => {
		startTransition(async () => {
			const res =
				target.kind === 'recipients'
					? await sendMessagesAction({
							channel,
							recipientType: target.recipientType,
							recipientIds: target.recipientIds,
							templateId,
							freeTextBody: templateId ? undefined : freeTextBody,
							freeTextSubject: templateId ? undefined : freeTextSubject,
						})
					: await sendToContactsAction({
							channel,
							contacts: target.contacts,
							templateId,
							freeTextBody: templateId ? undefined : freeTextBody,
							freeTextSubject: templateId ? undefined : freeTextSubject,
						});
			handleServiceResult(res, {
				onSuccess: (data) => setResult(data),
				onError: (err) => setError(String(err)),
			});
		});
	};

	if (result) {
		return (
			<div className="space-y-4">
				<Alert variant={result.failed > 0 ? 'destructive' : 'default'}>
					<AlertTitle>Messages Sent</AlertTitle>
					<AlertDescription>
						{result.sent} of {result.totalRequested} messages sent successfully.
						{result.failed > 0 && ` ${result.failed} failed.`}
					</AlertDescription>
				</Alert>
				{result.errors.length > 0 && (
					<div className="text-sm">
						<Label className="mb-1 block font-medium">Errors:</Label>
						<ul className="list-inside list-disc">
							{result.errors.map((e, i) => (
								<li key={i}>
									{e.entityId}: {e.error}
								</li>
							))}
						</ul>
					</div>
				)}
				<Button onClick={onComplete}>Close</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2 text-sm">
				<div>
					<Label className="font-medium">Channel:</Label> {channel}
				</div>
				<div>
					<Label className="font-medium">{target.kind === 'recipients' ? 'Recipients' : 'Contacts'}:</Label> {count}
				</div>
				<div>
					<Label className="font-medium">Content:</Label> {templateId ? 'Template' : 'Free Text'}
				</div>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<Button onClick={handleSend} disabled={isSending}>
				{isSending ? 'Sending...' : `Send to ${count} ${target.kind === 'recipients' ? 'recipient' : 'contact'}(s)`}
			</Button>
		</div>
	);
}
