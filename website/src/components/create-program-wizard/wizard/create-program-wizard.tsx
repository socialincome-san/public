'use client';

import { CreateProgramSteps } from './create-program-steps';
import { CreateProgramWizardFooter } from './create-program-wizard-footer';
import { CreateProgramWizardSend, CreateProgramWizardState } from './types';

type Props = {
	state: CreateProgramWizardState;
	send: CreateProgramWizardSend;
};

export const CreateProgramWizard = ({ state, send }: Props) => {
	return (
		<div className="space-y-6">
			<CreateProgramSteps state={state} send={send} />
			<CreateProgramWizardFooter state={state} send={send} />
		</div>
	);
}
