'use client';

import { CreateProgramSteps } from './create-program-steps';
import { CreateProgramWizardFooter } from './create-program-wizard-footer';
import { CreateProgramWizardSend, CreateProgramWizardState } from './types';

type Props = {
	state: CreateProgramWizardState;
	send: CreateProgramWizardSend;
	onGoToLogin: () => void;
};

export const CreateProgramWizard = ({ state, send, onGoToLogin }: Props) => {
	return (
		<div className="space-y-6">
			<CreateProgramSteps state={state} send={send} onGoToLogin={onGoToLogin} />
			{!state.matches('success') && <CreateProgramWizardFooter state={state} send={send} />}
		</div>
	);
};
