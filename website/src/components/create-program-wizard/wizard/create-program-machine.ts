import { Cause, PayoutInterval } from '@/generated/prisma/enums';
import { getCandidateCountAction } from '@/lib/server-actions/candidate-actions';
import { getProgramCountryFeasibilityAction } from '@/lib/server-actions/country-action';
import { createProgramAction } from '@/lib/server-actions/program-actions';
import { Profile } from '@/lib/services/candidate/candidate.types';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { CreateProgramInput } from '@/lib/services/program/program.types';
import type { Currency } from '@/lib/types/currency';
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
			targetProfiles: Profile[];

			// step 3
			amountOfRecipients: number;
			totalRecipients: number;
			filteredRecipients: number;
			isCountingRecipients: boolean;

			programDuration: number;
			payoutPerInterval: number;
			payoutInterval: PayoutInterval;
			currency: Currency;
			customizePayouts: boolean;

			// step 4
			isAuthenticated: boolean;

			// meta
			createdProgramId?: string;
			error?: string;
		};

		events: // step 1
		| { type: 'SELECT_COUNTRY'; id: string }
			| { type: 'TOGGLE_COUNTRY_ROW'; id: string }

			// step 2
			| { type: 'SELECT_PROGRAM_MANAGEMENT'; value: ProgramManagementType }
			| { type: 'SELECT_RECIPIENT_APPROACH'; value: RecipientApproachType }
			| { type: 'TOGGLE_TARGET_CAUSE'; cause: Cause }
			| { type: 'TOGGLE_TARGET_PROFILE'; profile: Profile }

			// step 3
			| { type: 'SET_AMOUNT_OF_RECIPIENTS'; value: number }
			| { type: 'SET_PROGRAM_DURATION'; value: number }
			| { type: 'SET_PAYOUT_PER_INTERVAL'; value: number }
			| { type: 'SET_PAYOUT_INTERVAL'; value: PayoutInterval }
			| { type: 'SET_CURRENCY'; value: Currency }
			| { type: 'TOGGLE_CUSTOMIZE_PAYOUTS' }
			| { type: 'NEXT' }
			| { type: 'BACK' }

			// step 4
			| { type: 'AUTH_SUCCESS' }

			// meta
			| { type: 'OPEN' }
			| { type: 'CLOSE' }
			| { type: 'RETRY' };

		input: {
			isAuthenticated: boolean;
		};
	},

	actors: {
		loadCountries: fromPromise(async () => {
			const result = await getProgramCountryFeasibilityAction();
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data.rows;
		}),

		saveProgram: fromPromise(async ({ input }: { input: CreateProgramInput }) => {
			const result = await createProgramAction(input);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data.programId;
		}),

		loadCandidateCounts: fromPromise(
			async ({
				input,
			}: {
				input: {
					countryId: string | null;
					causes?: Cause[];
					profiles?: Profile[];
				};
			}) => {
				const [total, filtered] = await Promise.all([
					getCandidateCountAction([], [], input.countryId),
					getCandidateCountAction(input.causes ?? [], input.profiles ?? [], input.countryId),
				]);

				if (!total.success) {
					throw new Error(total.error);
				}

				if (!filtered.success) {
					throw new Error(filtered.error);
				}

				return {
					total: total.data.count,
					filtered: filtered.data.count,
				};
			},
		),
	},

	guards: {
		// step 1
		countrySelected: ({ context }) => Boolean(context.selectedCountryId),

		// step 2
		programSetupValid: ({ context }) =>
			Boolean(context.programManagement) &&
			Boolean(context.recipientApproach) &&
			(context.recipientApproach === 'universal' ||
				context.targetCauses.length > 0 ||
				context.targetProfiles.length > 0),

		// step 2 → step 3
		programSetupValidWithRecipients: ({ context }) =>
			Boolean(context.programManagement) &&
			Boolean(context.recipientApproach) &&
			context.filteredRecipients > 0 &&
			(context.recipientApproach === 'universal' ||
				context.targetCauses.length > 0 ||
				context.targetProfiles.length > 0),

		// step 3
		budgetConfigValid: ({ context }) =>
			context.amountOfRecipients > 0 && context.programDuration > 0 && context.payoutPerInterval > 0,

		// step 3 → 4
		budgetConfigValidAndUnauthenticated: ({ context }) =>
			context.amountOfRecipients > 0 &&
			context.programDuration > 0 &&
			context.payoutPerInterval > 0 &&
			!context.isAuthenticated,
	},
}).createMachine({
	id: 'createProgramWizard',
	initial: 'closed',

	context: ({ input }) => ({
		// step 1
		countries: [],
		selectedCountryId: null,
		openCountryRowIds: [],

		// step 2
		programManagement: 'social_income',
		recipientApproach: null,
		targetCauses: [],
		targetProfiles: [],

		// step 3
		amountOfRecipients: 20,

		totalRecipients: 0,
		filteredRecipients: 0,
		isCountingRecipients: false,

		programDuration: 36,
		payoutPerInterval: 32,
		payoutInterval: 'monthly',
		currency: 'USD',
		customizePayouts: false,

		// step 4
		isAuthenticated: input?.isAuthenticated ?? false,

		// meta
		createdProgramId: undefined,
		error: undefined,
	}),

	states: {
		//step 1
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

		// Step 2
		programSetup: {
			invoke: {
				src: 'loadCandidateCounts',
				input: ({ context }) => ({
					countryId: context.selectedCountryId,
					causes: context.targetCauses,
					profiles: context.targetProfiles,
				}),
				onDone: {
					actions: assign({
						totalRecipients: ({ event }) => event.output.total,
						filteredRecipients: ({ event }) => event.output.filtered,
						amountOfRecipients: ({ event, context }) =>
							context.amountOfRecipients > event.output.filtered ? event.output.filtered : context.amountOfRecipients,
						isCountingRecipients: () => false,
					}),
				},
				onError: {
					target: 'error',
				},
			},
			entry: assign({ isCountingRecipients: () => true }),
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
						targetProfiles: () => [],
					}),
					target: 'programSetup',
					reenter: true,
				},
				TOGGLE_TARGET_CAUSE: {
					actions: assign({
						targetCauses: ({ context, event }) =>
							context.targetCauses.includes(event.cause)
								? context.targetCauses.filter((c) => c !== event.cause)
								: [...context.targetCauses, event.cause],
					}),
					target: 'programSetup',
					reenter: true,
				},
				TOGGLE_TARGET_PROFILE: {
					actions: assign({
						targetProfiles: ({ context, event }) =>
							context.targetProfiles.includes(event.profile)
								? context.targetProfiles.filter((p) => p !== event.profile)
								: [...context.targetProfiles, event.profile],
					}),
					target: 'programSetup',
					reenter: true,
				},
				BACK: 'countrySelection',
				NEXT: { guard: 'programSetupValidWithRecipients', target: 'budget' },
				CLOSE: 'closed',
			},
		},

		// Step 3
		budget: {
			on: {
				SET_AMOUNT_OF_RECIPIENTS: {
					actions: assign({ amountOfRecipients: ({ event }) => event.value }),
				},
				TOGGLE_CUSTOMIZE_PAYOUTS: {
					actions: assign({ customizePayouts: ({ context }) => !context.customizePayouts }),
				},
				SET_PROGRAM_DURATION: {
					actions: assign({ programDuration: ({ event }) => event.value }),
				},
				SET_PAYOUT_PER_INTERVAL: {
					actions: assign({ payoutPerInterval: ({ event }) => event.value }),
				},
				SET_PAYOUT_INTERVAL: {
					actions: assign({ payoutInterval: ({ event }) => event.value }),
				},
				SET_CURRENCY: {
					actions: assign({ currency: ({ event }) => event.value }),
				},
				BACK: 'programSetup',
				NEXT: [
					{ guard: 'budgetConfigValidAndUnauthenticated', target: 'auth' },
					{ guard: 'budgetConfigValid', target: 'saving' },
				],
				CLOSE: 'closed',
			},
		},

		// Step 4
		auth: {
			on: {
				AUTH_SUCCESS: {
					actions: assign({ isAuthenticated: () => true }),
					target: 'saving',
				},
				BACK: 'budget',
				CLOSE: 'closed',
			},
		},

		//meta
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

		saving: {
			invoke: {
				src: 'saveProgram',
				input: ({ context }): CreateProgramInput => ({
					countryId: context.selectedCountryId!,
					amountOfRecipientsForStart: context.amountOfRecipients,
					programDurationInMonths: context.programDuration,
					payoutPerInterval: context.payoutPerInterval,
					payoutCurrency: context.currency,
					payoutInterval: context.payoutInterval,
					targetCauses: context.targetCauses,
					targetProfiles: context.targetProfiles,
				}),
				onDone: {
					actions: assign({ createdProgramId: ({ event }) => event.output }),
					target: 'closed',
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
