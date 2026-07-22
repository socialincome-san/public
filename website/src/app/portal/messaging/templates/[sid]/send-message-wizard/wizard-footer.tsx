'use client';

import { Button } from '@/components/button';
import { Loader2 } from 'lucide-react';
import type { SendPhase } from './use-messaging-send';

type WizardFooterProps = {
	sendPhase: SendPhase;
	isFirstStep: boolean;
	isFinalStep: boolean;
	canAdvance: boolean;
	canSend: boolean;
	onBack: () => void;
	onNext: () => void;
	onSend: () => void;
	onClose: () => void;
};

export const WizardFooter = ({
	sendPhase,
	isFirstStep,
	isFinalStep,
	canAdvance,
	canSend,
	onBack,
	onNext,
	onSend,
	onClose,
}: WizardFooterProps) => {
	if (sendPhase === 'running') {
		return (
			<div className="-mx-6 flex items-center justify-end border-t px-6 pt-4">
				<Button variant="outline" disabled>
					<Loader2 className="animate-spin" />
					Sending…
				</Button>
			</div>
		);
	}

	if (sendPhase === 'results') {
		return (
			<div className="-mx-6 flex items-center justify-end border-t px-6 pt-4">
				<Button onClick={onClose}>Done</Button>
			</div>
		);
	}

	return (
		<div className="-mx-6 flex items-center justify-between border-t px-6 pt-4">
			<Button variant="outline" onClick={onBack} disabled={isFirstStep}>
				Back
			</Button>
			{isFinalStep ? (
				<Button variant="confirmed" onClick={onSend} disabled={!canSend}>
					Send message
				</Button>
			) : (
				<Button onClick={onNext} disabled={!canAdvance}>
					Next
				</Button>
			)}
		</div>
	);
};
