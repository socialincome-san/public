import { getProgramCountryFeasibilityAction } from '@/lib/server-actions/country-action';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { assign, fromPromise, setup } from 'xstate';

export const createProgramWizardMachine = setup({
	types: {} as {
		context: {
			countries: ProgramCountryFeasibilityRow[];
			selectedCountryId: string | null;
			openCountryRowIds: string[];
			programManagement: 'social_income' | 'self_run' | null;
			recipientApproach: 'universal' | 'targeted' | null;
			budget: number | null;
			error?: string;
		};
		events:
			| { type: 'OPEN' }
			| { type: 'CLOSE' }
			| { type: 'SELECT_COUNTRY'; id: string }
			| { type: 'TOGGLE_COUNTRY_ROW'; id: string }
			| { type: 'SELECT_PROGRAM_MANAGEMENT'; value: 'social_income' | 'self_run' }
			| { type: 'SELECT_RECIPIENT_APPROACH'; value: 'universal' | 'targeted' }
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
	},
	guards: {
		countrySelected: ({ context }) => Boolean(context.selectedCountryId),
		programSetupValid: ({ context }) => Boolean(context.programManagement) && Boolean(context.recipientApproach),
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
		budget: null,
	},

	states: {
		closed: {
			on: {
				OPEN: 'open',
			},
		},

		open: {
			initial: 'loadingCountries',

			on: {
				CLOSE: {
					target: 'closed',
					actions: assign({
						countries: () => [],
						selectedCountryId: () => null,
						openCountryRowIds: () => [],
						programManagement: () => null,
						recipientApproach: () => null,
						budget: () => null,
						error: () => undefined,
					}),
				},
			},

			states: {
				loadingCountries: {
					invoke: {
						src: 'loadCountries',
						onDone: {
							target: 'countrySelection',
							actions: assign({
								countries: ({ event }) => event.output,
							}),
						},
						onError: {
							target: 'error',
							actions: assign({
								error: ({ event }) => (event.error instanceof Error ? event.error.message : 'Failed to load countries'),
							}),
						},
					},
				},

				countrySelection: {
					id: 'step-1',
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
					},
				},

				programSetup: {
					id: 'step-2',
					on: {
						SELECT_PROGRAM_MANAGEMENT: {
							actions: assign({
								programManagement: ({ event }) => event.value,
							}),
						},

						SELECT_RECIPIENT_APPROACH: {
							actions: assign({
								recipientApproach: ({ event }) => event.value,
							}),
						},

						BACK: { target: 'countrySelection' },

						NEXT: {
							guard: 'programSetupValid',
							target: 'budget',
						},
					},
				},

				budget: {
					id: 'step-3',
					on: {
						SET_BUDGET: {
							actions: assign({
								budget: ({ event }) => event.value,
							}),
						},

						BACK: { target: 'programSetup' },

						NEXT: {
							guard: 'budgetValid',
							target: '#createProgramWizard.closed',
						},
					},
				},

				error: {},
			},
		},
	},
});
