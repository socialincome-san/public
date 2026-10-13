import type { ActorRefFrom, StateFrom } from 'xstate';
import { createProgramWizardMachine } from './create-program-machine';

type CreateProgramWizardActor = ActorRefFrom<typeof createProgramWizardMachine>;
export type CreateProgramWizardState = StateFrom<typeof createProgramWizardMachine>;
export type CreateProgramWizardSend = CreateProgramWizardActor['send'];
export type RecipientApproachType = 'universal' | 'targeted';
