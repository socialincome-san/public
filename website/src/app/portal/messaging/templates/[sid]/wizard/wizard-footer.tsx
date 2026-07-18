'use client';

import { Button } from '@/components/button';
import type { WizardStep } from './wizard-validity';

type Props = {
	currentStep: WizardStep;
	canAdvance: boolean;
	canSend: boolean;
	onBack: () => void;
	onNext: () => void;
	onSend: () => void;
};

export const WizardFooter = ({ currentStep, canAdvance, canSend, onBack, onNext, onSend }: Props) => {
	const isFinalStep = currentStep === 4;

	return (
		<div className="flex flex-col gap-2 border-t pt-4">
			<div className="flex items-center justify-between">
				<Button variant="outline" onClick={onBack} disabled={currentStep === 1}>
					Back
				</Button>
				{isFinalStep ? (
					<Button onClick={onSend} disabled={!canSend}>
						Send
					</Button>
				) : (
					<Button onClick={onNext} disabled={!canAdvance}>
						Next
					</Button>
				)}
			</div>
		</div>
	);
};
