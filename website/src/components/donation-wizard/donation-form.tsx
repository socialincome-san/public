'use client';

import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import { useDonationFormState } from './hooks/use-donation-form-state';
import { useDonationModal } from './hooks/use-donation-modal';
import type { DonationAmountFieldsTranslations } from './i18n/donation-amount-fields-translations';
import { DonationAmountFields } from './steps/step-amount/donation-amount-fields';
import { getDonationWizardCardClass } from './utils/donation-wizard-layout';
import { selectStep1FormView } from './wizard/donation-machine-selectors';

type Props = {
	campaignId?: string;
	onBeforeOpen?: () => void;
	translations: DonationAmountFieldsTranslations;
	currency: WebsiteCurrency;
};

export const DonationForm = ({ campaignId, onBeforeOpen, translations, currency }: Props) => {
	const { openWizardWithFormAmount } = useDonationModal();
	const form = useDonationFormState();

	return (
		<div data-testid="donation-wizard-hero-form" className="w-full">
			<DonationAmountFields
				className={cn(getDonationWizardCardClass('stepAmount'), 'mx-0 max-w-none lg:mx-auto lg:max-w-[400px]')}
				translations={translations}
				currency={currency}
				values={selectStep1FormView(form.context)}
				actions={{
					selectOnePercent: form.selectOnePercent,
					setMonthlyIncome: form.setMonthlyIncome,
					setPresetAmount: form.setPresetAmount,
					setCustomAmount: form.setCustomAmount,
					setCadence: form.setCadence,
				}}
				onSubmit={() => {
					if (form.isValid) {
						onBeforeOpen?.();
						openWizardWithFormAmount(campaignId ? { ...form.context, campaignId } : form.context);
					}
				}}
			/>
		</div>
	);
};
