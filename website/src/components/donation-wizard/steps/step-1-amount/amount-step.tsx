'use client';

import { createStep1Actions, selectStep1FormView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { DonationAmountFields } from './donation-amount-fields';

export const AmountStep = ({ state, send }: DonationWizardStepProps) => (
	<DonationAmountFields
		values={selectStep1FormView(state.context)}
		actions={createStep1Actions(send)}
		onSubmit={() => send({ type: 'SUBMIT' })}
	/>
);
