'use client';

import { createStep1Actions, selectStep1FormView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { DonationAmountFields } from './donation-amount-fields';

export const AmountStep = ({ state, send }: DonationWizardStepProps) => {
	const { currency } = state.context;

	return (
		<DonationAmountFields
			currency={currency}
			values={selectStep1FormView(state.context)}
			actions={createStep1Actions(send)}
			showTitle={false}
			onSubmit={(cadence) => {
				send({ type: 'SET_CADENCE', value: cadence });
				send({ type: 'SUBMIT' });
			}}
		/>
	);
};
