import type { ActorRefFrom, StateFrom } from 'xstate';
import { createProgramWizardMachine } from './create-program-machine';

export type CreateProgramWizardState = StateFrom<typeof createProgramWizardMachine>;
export type CreateProgramWizardActor = ActorRefFrom<typeof createProgramWizardMachine>;
export type CreateProgramWizardSend = CreateProgramWizardActor['send'];
