'use client';

import { CountrySelectionStep } from '../step-1/country-selection-step';
import { ProgramSetupStep } from '../step-2/program-setup-step';
import { BudgetStep } from '../step-3/budget-step';
import { LoginStep } from '../step-4/login-step';
import { WizardError } from './create-program-wizard-error';
import { WizardLoading } from './create-program-wizard-loading';
import { CreateProgramWizardSend, CreateProgramWizardState } from './types';

type Props = {
	state: CreateProgramWizardState;
	send: CreateProgramWizardSend;
};

export function CreateProgramSteps({ state, send }: Props) {
	if (state.matches('loading') || state.matches('saving')) {
		return <WizardLoading />;
	}

	if (state.matches('error')) {
		return (
			<WizardError message={state.context.error ?? 'Something went wrong'} onRetry={() => window.location.reload()} />
		);
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
				programManagement={state.context.programManagement}
				recipientApproach={state.context.recipientApproach}
				targetCauses={state.context.targetCauses}
				onSelectProgramManagement={(value) => send({ type: 'SELECT_PROGRAM_MANAGEMENT', value })}
				onSelectRecipientApproach={(value) => send({ type: 'SELECT_RECIPIENT_APPROACH', value })}
				onToggleCause={(cause) => send({ type: 'TOGGLE_TARGET_CAUSE', cause })}
			/>
		);
	}

	if (state.matches('budget')) {
		return (
			<BudgetStep
				amountOfRecipients={state.context.amountOfRecipients}
				programDuration={state.context.programDuration}
				payoutPerInterval={state.context.payoutPerInterval}
				payoutInterval={state.context.payoutInterval}
				currency={state.context.currency}
				customizePayouts={state.context.customizePayouts}
				onRecipientsChange={(v) => send({ type: 'SET_AMOUNT_OF_RECIPIENTS', value: v })}
				onDurationChange={(v) => send({ type: 'SET_PROGRAM_DURATION', value: v })}
				onPayoutChange={(v) => send({ type: 'SET_PAYOUT_PER_INTERVAL', value: v })}
				onIntervalChange={(v) => send({ type: 'SET_PAYOUT_INTERVAL', value: v })}
				onCurrencyChange={(v) => send({ type: 'SET_CURRENCY', value: v })}
				onToggleCustomizePayouts={() => send({ type: 'TOGGLE_CUSTOMIZE_PAYOUTS' })}
			/>
		);
	}

	if (state.matches('auth')) {
		return <LoginStep onSuccess={() => send({ type: 'AUTH_SUCCESS' })} />;
	}

	return null;
}
