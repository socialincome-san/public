'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { MessageChannel } from '@/generated/prisma/enums';
import { useState } from 'react';
import StepComposeContent from './step-compose-content';
import StepConfirmSend from './step-confirm-send';
import StepEnterContacts, { parseContacts } from './step-enter-contacts';
import StepSelectChannel from './step-select-channel';

type GenericSendDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type Step = 'channel' | 'contacts' | 'content' | 'confirm';

const STEP_TITLES: Record<Step, string> = {
	channel: 'Select Channel',
	contacts: 'Enter Contacts',
	content: 'Compose Message',
	confirm: 'Confirm & Send',
};

export default function GenericSendDialog({ open, onOpenChange }: GenericSendDialogProps) {
	const [step, setStep] = useState<Step>('channel');
	const [channel, setChannel] = useState<MessageChannel | null>(null);
	const [contactsText, setContactsText] = useState('');
	const [templateId, setTemplateId] = useState<string | undefined>(undefined);
	const [freeTextBody, setFreeTextBody] = useState('');
	const [freeTextSubject, setFreeTextSubject] = useState('');

	const reset = () => {
		setStep('channel');
		setChannel(null);
		setContactsText('');
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

	const contacts = parseContacts(contactsText);

	const canProceed = (): boolean => {
		switch (step) {
			case 'channel':
				return channel !== null;
			case 'contacts':
				return contacts.length > 0;
			case 'content':
				return templateId !== undefined || freeTextBody.trim().length > 0;
			case 'confirm':
				return false;
		}
	};

	const nextStep = () => {
		switch (step) {
			case 'channel':
				setStep('contacts');
				break;
			case 'contacts':
				setStep('content');
				break;
			case 'content':
				setStep('confirm');
				break;
		}
	};

	const prevStep = () => {
		switch (step) {
			case 'contacts':
				setStep('channel');
				break;
			case 'content':
				setStep('contacts');
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

				{step === 'channel' && <StepSelectChannel channel={channel} onChannelChange={setChannel} />}

				{step === 'contacts' && channel && (
					<StepEnterContacts channel={channel} contactsText={contactsText} onContactsTextChange={setContactsText} />
				)}

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

				{step === 'confirm' && channel && (
					<StepConfirmSend
						channel={channel}
						target={{ kind: 'freetext', contacts }}
						templateId={templateId}
						freeTextBody={freeTextBody}
						freeTextSubject={freeTextSubject}
						onComplete={() => handleOpenChange(false)}
					/>
				)}

				{step !== 'confirm' && (
					<div className="flex justify-between pt-4">
						<Button variant="outline" onClick={step === 'channel' ? () => handleOpenChange(false) : prevStep}>
							{step === 'channel' ? 'Cancel' : 'Back'}
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
