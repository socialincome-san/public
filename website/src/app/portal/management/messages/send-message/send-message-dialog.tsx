'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { MessageChannel, MessageRecipientType } from '@/generated/prisma/enums';
import { useState } from 'react';
import StepComposeContent from './step-compose-content';
import StepConfirmSend from './step-confirm-send';
import StepSelectChannel from './step-select-channel';
import StepSelectEntities from './step-select-entities';

type SendMessageDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type Step = 'entities' | 'channel' | 'content' | 'confirm';

const STEP_TITLES: Record<Step, string> = {
	entities: 'Select Recipients',
	channel: 'Select Channel',
	content: 'Compose Message',
	confirm: 'Confirm & Send',
};

export default function SendMessageDialog({ open, onOpenChange }: SendMessageDialogProps) {
	const [step, setStep] = useState<Step>('entities');
	const [recipientType, setRecipientType] = useState<MessageRecipientType | null>(null);
	const [recipientIds, setRecipientIds] = useState<string[]>([]);
	const [channel, setChannel] = useState<MessageChannel | null>(null);
	const [templateId, setTemplateId] = useState<string | undefined>(undefined);
	const [freeTextBody, setFreeTextBody] = useState('');
	const [freeTextSubject, setFreeTextSubject] = useState('');

	const reset = () => {
		setStep('entities');
		setRecipientType(null);
		setRecipientIds([]);
		setChannel(null);
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
			case 'entities':
				return recipientType !== null && recipientIds.length > 0;
			case 'channel':
				return channel !== null;
			case 'content':
				return templateId !== undefined || freeTextBody.trim().length > 0;
			case 'confirm':
				return false;
		}
	};

	const nextStep = () => {
		switch (step) {
			case 'entities':
				setStep('channel');
				break;
			case 'channel':
				setStep('content');
				break;
			case 'content':
				setStep('confirm');
				break;
		}
	};

	const prevStep = () => {
		switch (step) {
			case 'channel':
				setStep('entities');
				break;
			case 'content':
				setStep('channel');
				break;
			case 'confirm':
				setStep('content');
				break;
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{STEP_TITLES[step]}</DialogTitle>
				</DialogHeader>

				{step === 'entities' && (
					<StepSelectEntities
						recipientType={recipientType}
						onRecipientTypeChange={setRecipientType}
						recipientIds={recipientIds}
						onRecipientIdsChange={setRecipientIds}
					/>
				)}

				{step === 'channel' && <StepSelectChannel channel={channel} onChannelChange={setChannel} />}

				{step === 'content' && channel && (
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

				{step === 'confirm' && channel && recipientType && (
					<StepConfirmSend
						channel={channel}
						recipientType={recipientType}
						recipientIds={recipientIds}
						templateId={templateId}
						freeTextBody={freeTextBody}
						freeTextSubject={freeTextSubject}
						onComplete={() => handleOpenChange(false)}
					/>
				)}

				{step !== 'confirm' && (
					<div className="flex justify-between pt-4">
						<Button variant="outline" onClick={step === 'entities' ? () => handleOpenChange(false) : prevStep}>
							{step === 'entities' ? 'Cancel' : 'Back'}
						</Button>
						<Button onClick={nextStep} disabled={!canProceed()}>
							Next
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
