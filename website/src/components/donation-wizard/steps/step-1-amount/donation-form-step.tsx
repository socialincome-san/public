'use client';

import { DonationAmountFields } from '../../shared/donation-amount-fields';
import { createStep1Actions, selectStep1FormView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';

export const DonationFormStep = ({ state, send }: DonationWizardStepProps) => (
	<DonationAmountFields
		values={selectStep1FormView(state.context)}
		actions={createStep1Actions(send)}
		onSubmit={() => send({ type: 'SUBMIT' })}
	/>
);
