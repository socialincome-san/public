'use client';

import { getDonationWizardCardClass } from '../../utils/donation-wizard-layout';
import { createStep1Actions, selectStep1FormView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { DonationAmountFields } from './donation-amount-fields';

export const AmountStep = ({ state, send }: DonationWizardStepProps) => (
	<DonationAmountFields
		className={getDonationWizardCardClass('stepAmount')}
		values={selectStep1FormView(state.context)}
		actions={createStep1Actions(send)}
		onSubmit={() => send({ type: 'SUBMIT' })}
	/>
);
