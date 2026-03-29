'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { Label } from '@/components/label';
import { MessageChannel, MessageRecipientType } from '@/generated/prisma/enums';
import { sendMessagesAction } from '@/lib/server-actions/messaging-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { MessageBatchResult } from '@/lib/services/messaging/messaging.types';
import { useState, useTransition } from 'react';

type StepConfirmSendProps = {
	channel: MessageChannel;
	recipientType: MessageRecipientType;
	recipientIds: string[];
	templateId: string | undefined;
	freeTextBody: string;
	freeTextSubject: string;
	onComplete: () => void;
};

export default function StepConfirmSend({
	channel,
	recipientType,
	recipientIds,
	templateId,
	freeTextBody,
	freeTextSubject,
	onComplete,
}: StepConfirmSendProps) {
	const [isSending, startTransition] = useTransition();
	const [result, setResult] = useState<MessageBatchResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSend = () => {
		startTransition(async () => {
			const res = await sendMessagesAction({
				channel,
				recipientType,
				recipientIds,
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
					<Label className="font-medium">Entity Type:</Label> {recipientType}
				</div>
				<div>
					<Label className="font-medium">Recipients:</Label> {recipientIds.length}
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
				{isSending ? 'Sending...' : `Send to ${recipientIds.length} recipient(s)`}
			</Button>
		</div>
	);
}
