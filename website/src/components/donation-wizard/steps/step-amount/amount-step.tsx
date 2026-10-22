'use client';

import { useVisitorCountryCode, useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { useEffect } from 'react';
import { isDonationExampleCountryCode } from '../../utils/donation-example-income';
import { createStep1Actions, selectStep1FormView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { DonationAmountFields } from './donation-amount-fields';

export const AmountStep = ({ state, send }: DonationWizardStepProps) => {
	const currency = useWebsiteCurrency();
	const visitorCountryCode = useVisitorCountryCode();

	useEffect(() => {
		if (
			visitorCountryCode &&
			isDonationExampleCountryCode(visitorCountryCode) &&
			state.context.exampleCountryCode !== visitorCountryCode &&
			!state.context.countryIsManuallySelected
		) {
			send({ type: 'SET_COUNTRY', countryCode: visitorCountryCode, source: 'detected' });
		}
	}, [send, state.context.countryIsManuallySelected, state.context.exampleCountryCode, visitorCountryCode]);

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
