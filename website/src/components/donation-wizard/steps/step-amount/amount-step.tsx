'use client';

import { useI18n } from '@/lib/i18n/use-i18n';
import { createStep1Actions, selectStep1FormView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { DonationAmountFields } from './donation-amount-fields';

export const AmountStep = ({ state, send }: DonationWizardStepProps) => {
	const { currency = 'CHF' } = useI18n();

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
