'use client';

import { Currency } from '@/generated/prisma/enums';
import { useTranslations } from 'next-intl';
import { CountrySelectionStep } from '../step-1/country-selection-step';
import { ProgramSetupStep } from '../step-2/program-setup-step';
import { BudgetStep } from '../step-3/budget-step';
import { AccountDetailsStep } from '../step-4/account-details-step';
import { SuccessStep } from '../step-5/success-step';
import { WizardError } from './create-program-wizard-error';
import { WizardLoading } from './create-program-wizard-loading';
import { CreateProgramWizardSend, CreateProgramWizardState } from './types';

type Props = {
	state: CreateProgramWizardState;
	send: CreateProgramWizardSend;
	onGoToLogin: () => void;
};

export const CreateProgramSteps = ({ state, send, onGoToLogin }: Props) => {
	const t = useTranslations('create-program-wizard');

	if (state.matches('loading') || state.matches('saving')) {
		return <WizardLoading />;
	}

	if (state.matches('error')) {
		return <WizardError message={state.context.error ?? t('error.generic')} onRetry={() => window.location.reload()} />;
	}

	if (state.matches('countrySelection')) {
		return (
			<CountrySelectionStep
				rows={state.context.countries}
				selectedCountryId={state.context.selectedCountryId}
				openRowIds={state.context.openCountryRowIds}
				onSelectCountry={(id) => send({ type: 'SELECT_COUNTRY', id })}
				onToggleRow={(id) => send({ type: 'TOGGLE_COUNTRY_ROW', id })}
			/>
		);
	}

	if (state.matches('programSetup')) {
		return (
			<ProgramSetupStep
				recipientApproach={state.context.recipientApproach}
				targetFocuses={state.context.targetFocuses}
				focusOptions={state.context.focusOptions}
				focusOptionsError={state.context.focusOptionsError}
				targetProfiles={state.context.targetProfiles}
				targetLocalPartnerIds={state.context.targetLocalPartnerIds}
				localPartnerOptions={state.context.localPartnerOptions}
				localPartnerOptionsError={state.context.localPartnerOptionsError}
				totalRecipients={state.context.totalRecipients}
				filteredRecipients={state.context.filteredRecipients}
				isCountingRecipients={state.context.isCountingRecipients}
				onSelectRecipientApproach={(value) => send({ type: 'SELECT_RECIPIENT_APPROACH', value })}
				onToggleFocus={(focus) => send({ type: 'TOGGLE_TARGET_FOCUS', focus })}
				onToggleProfile={(profile) => send({ type: 'TOGGLE_TARGET_PROFILE', profile })}
				onToggleLocalPartner={(localPartnerId) => send({ type: 'TOGGLE_TARGET_LOCAL_PARTNER', localPartnerId })}
			/>
		);
	}

	if (state.matches('budget')) {
		return (
			<BudgetStep
				recipientsTitle={t('step3.recipients.title')}
				totalCostsTitle={t('step3.total_costs.title')}
				amountOfRecipients={state.context.amountOfRecipients}
				filteredRecipients={state.context.filteredRecipients}
				programDuration={state.context.programDuration}
				payoutPerInterval={state.context.payoutPerInterval}
				payoutInterval={state.context.payoutInterval}
				payoutCurrency={state.context.payoutCurrency}
				displayCurrency={state.context.displayCurrency}
				calculatedTotalBudget={state.context.calculatedTotalBudget}
				displayMonthlyCost={state.context.displayMonthlyCost}
				exchangeRateText={state.context.exchangeRateText}
				payoutToDisplayRate={state.context.payoutToDisplayRate}
				isCalculatingBudget={state.context.isCalculatingBudget}
				payoutCustomization={{
					enabled: state.context.customizePayouts,
					payoutPerIntervalMin: state.context.payoutPerIntervalMin,
					payoutPerIntervalMax: state.context.payoutPerIntervalMax,
					onToggle: () => send({ type: 'TOGGLE_CUSTOMIZE_PAYOUTS' }),
					onDurationChange: (v) => send({ type: 'SET_PROGRAM_DURATION', value: v }),
					onPayoutChange: (v) => send({ type: 'SET_PAYOUT_PER_INTERVAL', value: v }),
					onIntervalChange: (v) => send({ type: 'SET_PAYOUT_INTERVAL', value: v }),
				}}
				onRecipientsChange={(v) => send({ type: 'SET_AMOUNT_OF_RECIPIENTS', value: v })}
				onCurrencyChange={(v) => send({ type: 'SET_CURRENCY', value: v as Currency })}
			/>
		);
	}

	if (state.matches('accountDetails')) {
		return (
			<AccountDetailsStep
				email={state.context.contactEmail}
				firstName={state.context.contactFirstName}
				lastName={state.context.contactLastName}
				onEmailChange={(value) => send({ type: 'SET_CONTACT_EMAIL', value })}
				onFirstNameChange={(value) => send({ type: 'SET_CONTACT_FIRST_NAME', value })}
				onLastNameChange={(value) => send({ type: 'SET_CONTACT_LAST_NAME', value })}
			/>
		);
	}

	if (state.matches('success')) {
		return <SuccessStep onGoToLogin={onGoToLogin} />;
	}

	return null;
};
