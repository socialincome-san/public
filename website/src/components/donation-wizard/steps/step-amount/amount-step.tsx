'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { getDonationAmountFieldsTranslations } from '../../i18n/donation-amount-fields-translations';
import { getDonationWizardCardClass } from '../../utils/donation-wizard-layout';
import { createStep1Actions, selectStep1FormView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { DonationAmountFields } from './donation-amount-fields';

export const AmountStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();

	return (
		<DonationAmountFields
			className={getDonationWizardCardClass('stepAmount')}
			translations={getDonationAmountFieldsTranslations(t)}
			currency={currency}
			values={selectStep1FormView(state.context)}
			actions={createStep1Actions(send)}
			onSubmit={() => send({ type: 'SUBMIT' })}
		/>
	);
};
