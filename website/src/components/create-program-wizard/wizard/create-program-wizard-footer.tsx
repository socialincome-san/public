'use client';

import { Button } from '@/components/button';
import { CreateProgramStepIndicator } from './create-program-step-indicator';
import { CreateProgramWizardSend, CreateProgramWizardState } from './types';

type Props = {
	state: CreateProgramWizardState;
	send: CreateProgramWizardSend;
};

export const CreateProgramWizardFooter = ({ state, send }: Props) => {
	return (
		<div className="flex items-center justify-between border-t pt-4">
			<Button variant="outline" onClick={() => send({ type: 'BACK' })} disabled={!state.can({ type: 'BACK' })}>
				Back
			</Button>

			<CreateProgramStepIndicator state={state} />

			<Button onClick={() => send({ type: 'NEXT' })} disabled={!state.can({ type: 'NEXT' })}>
				Continue
			</Button>
		</div>
	);
};
