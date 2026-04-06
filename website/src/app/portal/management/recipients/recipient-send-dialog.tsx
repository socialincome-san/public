'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { MessageChannel, MessageRecipientType } from '@/generated/prisma/enums';
import { useState } from 'react';
import StepComposeContent from '../messages/send-message/step-compose-content';
import StepConfirmSend from '../messages/send-message/step-confirm-send';

type RecipientSendDialogProps = {
	recipientIds: string[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type Step = 'content' | 'confirm';

const STEP_TITLES: Record<Step, string> = {
	content: 'Compose Message',
	confirm: 'Confirm & Send',
};

export default function RecipientSendDialog({ recipientIds, open, onOpenChange }: RecipientSendDialogProps) {
	const channel = MessageChannel.whatsapp;
	const [step, setStep] = useState<Step>('content');
	const [templateId, setTemplateId] = useState<string | undefined>(undefined);
	const [freeTextBody, setFreeTextBody] = useState('');
	const [freeTextSubject, setFreeTextSubject] = useState('');

	const reset = () => {
		setStep('content');
		setTemplateId(undefined);
		setFreeTextBody('');
		setFreeTextSubject('');
	};

	const handleOpenChange = (nextOpen: boolean) => {
		onOpenChange(nextOpen);
		if (!nextOpen) {
			reset();
		}
	};

	const canProceed = (): boolean => {
		switch (step) {
			case 'content':
				return templateId !== undefined || freeTextBody.trim().length > 0;
			case 'confirm':
				return false;
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{STEP_TITLES[step]} — {recipientIds.length} recipient{recipientIds.length !== 1 ? 's' : ''} via WhatsApp
					</DialogTitle>
				</DialogHeader>

				{step === 'content' && (
					<StepComposeContent
						channel={channel}
						templateId={templateId}
						onTemplateIdChange={setTemplateId}
						freeTextBody={freeTextBody}
						onFreeTextBodyChange={setFreeTextBody}
						freeTextSubject={freeTextSubject}
						onFreeTextSubjectChange={setFreeTextSubject}
					/>
				)}

				{step === 'confirm' && (
					<StepConfirmSend
						channel={channel}
						target={{
							kind: 'recipients',
							recipientType: MessageRecipientType.recipient,
							recipientIds,
						}}
						templateId={templateId}
						freeTextBody={freeTextBody}
						freeTextSubject={freeTextSubject}
						onComplete={() => handleOpenChange(false)}
					/>
				)}

				{step === 'content' && (
					<div className="flex justify-between pt-4">
						<Button variant="outline" onClick={() => handleOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={() => setStep('confirm')} disabled={!canProceed()}>
							Next
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
