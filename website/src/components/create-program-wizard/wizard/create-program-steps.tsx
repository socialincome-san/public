'use client';

import { CountrySelectionStep } from '../step-1/country-selection-step';
import { ProgramSetupStep } from '../step-2/program-setup-step';
import { BudgetStep } from '../step-3/budget-step';
import { CreateProgramWizardSend, CreateProgramWizardState } from './types';

type Props = {
	state: CreateProgramWizardState;
	send: CreateProgramWizardSend;
};

export function CreateProgramSteps({ state, send }: Props) {
	if (state.matches({ open: 'countrySelection' })) {
		return (
			<CountrySelectionStep
				loading={state.matches({ open: 'loadingCountries' })}
				rows={state.context.countries}
				selectedCountryId={state.context.selectedCountryId}
				openRowIds={state.context.openCountryRowIds}
				onSelectCountry={(id) => send({ type: 'SELECT_COUNTRY', id })}
				onToggleRow={(id) => send({ type: 'TOGGLE_COUNTRY_ROW', id })}
			/>
		);
	}

	if (state.matches({ open: 'programSetup' })) {
		return (
			<ProgramSetupStep
				programManagement={state.context.programManagement}
				recipientApproach={state.context.recipientApproach}
				onSelectProgramManagement={(value) => send({ type: 'SELECT_PROGRAM_MANAGEMENT', value })}
				onSelectRecipientApproach={(value) => send({ type: 'SELECT_RECIPIENT_APPROACH', value })}
			/>
		);
	}

	if (state.matches({ open: 'budget' })) {
		return <BudgetStep value={state.context.budget} onChange={(value) => send({ type: 'SET_BUDGET', value })} />;
	}

	return null;
}
