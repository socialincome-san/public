import { getProgramCountryFeasibilityAction } from '@/lib/server-actions/country-action';
import { createProgramAction } from '@/lib/server-actions/program-actions';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { Cause, PayoutInterval } from '@prisma/client';
import { assign, fromPromise, setup } from 'xstate';
import type { ProgramManagementType, RecipientApproachType } from './types';

export const createProgramWizardMachine = setup({
	types: {} as {
		context: {
			// step 1
			countries: ProgramCountryFeasibilityRow[];
			selectedCountryId: string | null;
			openCountryRowIds: string[];

			// step 2
			programManagement: ProgramManagementType | null;
			recipientApproach: RecipientApproachType | null;
			targetCauses: Cause[];

			// step 3 – budget / payouts
			amountOfRecipients: number;

			// payouts (defaults = recommended)
			programDuration: number;
			payoutPerInterval: number;
			payoutInterval: PayoutInterval;
			currency: string;

			// NEW
			customizePayouts: boolean;

			// meta
			createdProgramId?: string;
			error?: string;
		};

		events:
			| { type: 'OPEN' }
			| { type: 'CLOSE' }
			| { type: 'RETRY' }

			// step 1
			| { type: 'SELECT_COUNTRY'; id: string }
			| { type: 'TOGGLE_COUNTRY_ROW'; id: string }

			// step 2
			| { type: 'SELECT_PROGRAM_MANAGEMENT'; value: ProgramManagementType }
			| { type: 'SELECT_RECIPIENT_APPROACH'; value: RecipientApproachType }
			| { type: 'TOGGLE_TARGET_CAUSE'; cause: Cause }

			// step 3
			| { type: 'SET_AMOUNT_OF_RECIPIENTS'; value: number }
			| { type: 'SET_PROGRAM_DURATION'; value: number }
			| { type: 'SET_PAYOUT_PER_INTERVAL'; value: number }
			| { type: 'SET_PAYOUT_INTERVAL'; value: PayoutInterval }
			| { type: 'SET_CURRENCY'; value: string }
			| { type: 'TOGGLE_CUSTOMIZE_PAYOUTS' }
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
					amountOfRecipients: number;
					programDuration: number;
					payoutPerInterval: number;
					payoutInterval: PayoutInterval;
					currency: string;
				};
			}) => {
				const res = await createProgramAction(input);
				if (!res.success) throw new Error(res.error);
				return res.data.programId;
			},
		),
	},

	guards: {
		countrySelected: ({ context }) => Boolean(context.selectedCountryId),

		programSetupValid: ({ context }) =>
			Boolean(context.programManagement) &&
			Boolean(context.recipientApproach) &&
			(context.recipientApproach === 'universal' || context.targetCauses.length > 0),

		budgetConfigValid: ({ context }) =>
			context.amountOfRecipients > 0 && context.programDuration > 0 && context.payoutPerInterval > 0,
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

		amountOfRecipients: 20,

		// recommended defaults
		programDuration: 36,
		payoutPerInterval: 32,
		payoutInterval: 'monthly',
		currency: 'USD',

		// NEW
		customizePayouts: false,

		createdProgramId: undefined,
		error: undefined,
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
				NEXT: { guard: 'countrySelected', target: 'programSetup' },
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
						targetCauses: () => [],
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
				NEXT: { guard: 'programSetupValid', target: 'budget' },
				CLOSE: 'closed',
			},
		},

		budget: {
			on: {
				SET_AMOUNT_OF_RECIPIENTS: {
					actions: assign({
						amountOfRecipients: ({ event }) => event.value,
					}),
				},
				TOGGLE_CUSTOMIZE_PAYOUTS: {
					actions: assign({
						customizePayouts: ({ context }) => !context.customizePayouts,
					}),
				},

				// only meaningful when customizePayouts === true (UI-enforced)
				SET_PROGRAM_DURATION: {
					actions: assign({
						programDuration: ({ event }) => event.value,
					}),
				},
				SET_PAYOUT_PER_INTERVAL: {
					actions: assign({
						payoutPerInterval: ({ event }) => event.value,
					}),
				},
				SET_PAYOUT_INTERVAL: {
					actions: assign({
						payoutInterval: ({ event }) => event.value,
					}),
				},
				SET_CURRENCY: {
					actions: assign({
						currency: ({ event }) => event.value,
					}),
				},

				BACK: 'programSetup',
				NEXT: { guard: 'budgetConfigValid', target: 'saving' },
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
					amountOfRecipients: context.amountOfRecipients,
					programDuration: context.programDuration,
					payoutPerInterval: context.payoutPerInterval,
					payoutInterval: context.payoutInterval,
					currency: context.currency,
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
				RETRY: { actions: () => window.location.reload() },
				CLOSE: 'closed',
			},
		},
	},
});
