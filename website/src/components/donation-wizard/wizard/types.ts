import type { ActorRefFrom, StateFrom } from 'xstate';
import type { donationWizardMachine } from './donation-machine';

export type DonationWizardState = StateFrom<typeof donationWizardMachine>;
export type DonationWizardSend = ActorRefFrom<typeof donationWizardMachine>['send'];

export type DonationWizardStepProps = {
	state: DonationWizardState;
	send: DonationWizardSend;
};
