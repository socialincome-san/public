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
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex-1 overflow-y-auto" role="region" aria-label="Wizard content">
				<CreateProgramSteps state={state} send={send} onGoToLogin={onGoToLogin} />
			</div>
			{!state.matches('success') && <CreateProgramWizardFooter state={state} send={send} />}
		</div>
	);
};
