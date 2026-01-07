import { getProgramCountryFeasibilityAction } from '@/lib/server-actions/country-action';
import { createProgramAction } from '@/lib/server-actions/program-actions';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { Cause } from '@prisma/client';
import { assign, fromPromise, setup } from 'xstate';
import type { ProgramManagementType, RecipientApproachType } from './types';

export const createProgramWizardMachine = setup({
	types: {} as {
		context: {
			countries: ProgramCountryFeasibilityRow[];
			selectedCountryId: string | null;
			openCountryRowIds: string[];
			programManagement: ProgramManagementType | null;
			recipientApproach: RecipientApproachType | null;
			targetCauses: Cause[];
			budget: number | null;
			createdProgramId?: string;
			error?: string;
		};
		events:
			| { type: 'OPEN' }
			| { type: 'CLOSE' }
			| { type: 'RETRY' }
			| { type: 'SELECT_COUNTRY'; id: string }
			| { type: 'TOGGLE_COUNTRY_ROW'; id: string }
			| { type: 'SELECT_PROGRAM_MANAGEMENT'; value: ProgramManagementType }
			| { type: 'SELECT_RECIPIENT_APPROACH'; value: RecipientApproachType }
			| { type: 'TOGGLE_TARGET_CAUSE'; cause: Cause }
			| { type: 'SET_BUDGET'; value: number }
			| { type: 'NEXT' }
			| { type: 'BACK' };
	},
	actors: {
		loadCountries: fromPromise(async () => {
			const res = await getProgramCountryFeasibilityAction();
			if (!res.success) throw new Error(res.error);
			return res.data.rows;
		}),
		saveProgram: fromPromise(
			async ({
				input,
			}: {
				input: {
					countryId: string;
					programManagement: ProgramManagementType;
					recipientApproach: RecipientApproachType;
					targetCauses: Cause[];
					budget: number;
				};
			}) => {
				const res = await createProgramAction(input);
				if (!res.success) {
					throw new Error(res.error);
				}
				return res.data.programId;
			},
		),
	},
	guards: {
		countrySelected: ({ context }) => Boolean(context.selectedCountryId),

		programSetupValid: ({ context }) => {
			if (!context.programManagement || !context.recipientApproach) {
				return false;
			}

			if (context.recipientApproach === 'targeted') {
				return context.targetCauses.length > 0;
			}

			return true;
		},

		budgetValid: ({ context }) => typeof context.budget === 'number' && context.budget > 0,
	},
}).createMachine({
	id: 'createProgramWizard',
	initial: 'closed',

	context: {
		countries: [],
		selectedCountryId: null,
		openCountryRowIds: [],
		programManagement: null,
		recipientApproach: null,
		targetCauses: [],
		budget: null,
	},

	states: {
		closed: {
			on: { OPEN: 'loading' },
		},

		loading: {
			invoke: {
				src: 'loadCountries',
				onDone: {
					target: 'countrySelection',
					actions: assign({
						countries: ({ event }) => event.output,
						error: () => undefined,
					}),
				},
				onError: {
					target: 'error',
					actions: assign({
						error: ({ event }) => (event.error instanceof Error ? event.error.message : 'Failed to load data'),
					}),
				},
			},
		},

		countrySelection: {
			on: {
				SELECT_COUNTRY: {
					actions: assign({
						selectedCountryId: ({ event }) => event.id,
					}),
				},
				TOGGLE_COUNTRY_ROW: {
					actions: assign({
						openCountryRowIds: ({ context, event }) =>
							context.openCountryRowIds.includes(event.id)
								? context.openCountryRowIds.filter((id) => id !== event.id)
								: [...context.openCountryRowIds, event.id],
					}),
				},
				NEXT: {
					guard: 'countrySelected',
					target: 'programSetup',
				},
				CLOSE: 'closed',
			},
		},

		programSetup: {
			on: {
				SELECT_PROGRAM_MANAGEMENT: {
					actions: assign({
						programManagement: ({ event }) => event.value,
					}),
				},

				SELECT_RECIPIENT_APPROACH: {
					actions: assign({
						recipientApproach: ({ event }) => event.value,
						targetCauses: ({ event }) => (event.value === 'universal' ? [] : []),
					}),
				},

				TOGGLE_TARGET_CAUSE: {
					actions: assign({
						targetCauses: ({ context, event }) =>
							context.targetCauses.includes(event.cause)
								? context.targetCauses.filter((c) => c !== event.cause)
								: [...context.targetCauses, event.cause],
					}),
				},

				BACK: 'countrySelection',

				NEXT: {
					guard: 'programSetupValid',
					target: 'budget',
				},

				CLOSE: 'closed',
			},
		},

		budget: {
			on: {
				SET_BUDGET: {
					actions: assign({
						budget: ({ event }) => event.value,
					}),
				},
				BACK: 'programSetup',
				NEXT: {
					guard: 'budgetValid',
					target: 'saving',
				},
				CLOSE: 'closed',
			},
		},

		saving: {
			invoke: {
				src: 'saveProgram',
				input: ({ context }) => ({
					countryId: context.selectedCountryId!,
					programManagement: context.programManagement!,
					recipientApproach: context.recipientApproach!,
					targetCauses: context.targetCauses,
					budget: context.budget!,
				}),
				onDone: {
					target: 'closed',
					actions: assign({
						createdProgramId: ({ event }) => event.output,
					}),
				},
				onError: {
					target: 'error',
					actions: assign({
						error: ({ event }) => (event.error instanceof Error ? event.error.message : 'Failed to create program'),
					}),
				},
			},
		},

		error: {
			on: {
				RETRY: {
					actions: () => window.location.reload(),
				},
				CLOSE: 'closed',
			},
		},
	},
});
