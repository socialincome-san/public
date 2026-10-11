'use client';

import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { createStep1Actions, selectStep1FormView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { DonationAmountFields } from './donation-amount-fields';

export const AmountStep = ({ state, send }: DonationWizardStepProps) => {
	const currency = useWebsiteCurrency();

	return (
		<DonationAmountFields
			currency={currency}
			values={selectStep1FormView(state.context)}
			actions={createStep1Actions(send)}
			showTitle={false}
			onSubmit={() => send({ type: 'SUBMIT' })}
		/>
	);
};
