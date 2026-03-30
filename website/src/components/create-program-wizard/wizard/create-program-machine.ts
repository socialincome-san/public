import { Currency, PayoutInterval, Profile } from '@/generated/prisma/enums';
import { getCandidateCountAction } from '@/lib/server-actions/candidate-actions';
import { getProgramCountryFeasibilityAction } from '@/lib/server-actions/country-action';
import { getFocusOptionsAction } from '@/lib/server-actions/focus-action';
import { createProgramAction } from '@/lib/server-actions/program-actions';
import { calculateProgramBudgetAction } from '@/lib/server-actions/program-stats-actions';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { CreateProgramInput, PublicOnboardingUserDetails } from '@/lib/services/program/program.types';
import { EMAIL_REGEX } from '@/lib/utils/regex';
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
			targetFocuses: string[];
			focusOptions: { id: string; name: string }[];
			targetProfiles: Profile[];

			// step 3
			amountOfRecipients: number;
			totalRecipients: number;
			filteredRecipients: number;
			isCountingRecipients: boolean;

			programDuration: number;
			defaultPayoutPerInterval: number;
			payoutPerInterval: number;
			payoutInterval: PayoutInterval;
			payoutCurrency: Currency;
			displayCurrency: Currency;
			calculatedTotalBudget: number;
			displayMonthlyCost: number;
			exchangeRateText?: string;
			totalBudgetTooltipText: string;
			payoutPerIntervalMin: number;
			payoutPerIntervalMax: number;
			isCalculatingBudget: boolean;
			customizePayouts: boolean;

			// step 4
			isAuthenticated: boolean;
			contactEmail: string;
			contactFirstName: string;
			contactLastName: string;

			// meta
			createdProgramId?: string;
			error?: string;
		};

		events:
			| { type: 'SELECT_COUNTRY'; id: string }
			| { type: 'TOGGLE_COUNTRY_ROW'; id: string }

			// step 2
			| { type: 'SELECT_PROGRAM_MANAGEMENT'; value: ProgramManagementType }
			| { type: 'SELECT_RECIPIENT_APPROACH'; value: RecipientApproachType }
			| { type: 'TOGGLE_TARGET_FOCUS'; focus: string }
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
			| { type: 'SET_CONTACT_EMAIL'; value: string }
			| { type: 'SET_CONTACT_FIRST_NAME'; value: string }
			| { type: 'SET_CONTACT_LAST_NAME'; value: string }

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
			const [countryResult, focusOptionsResult] = await Promise.all([
				getProgramCountryFeasibilityAction(),
				getFocusOptionsAction(),
			]);
			if (!countryResult.success) {
				throw new Error(countryResult.error);
			}
			if (!focusOptionsResult.success) {
				throw new Error(focusOptionsResult.error);
			}

			return {
				countries: countryResult.data.rows,
				focusOptions: focusOptionsResult.data,
			};
		}),

		saveProgram: fromPromise(
			async ({ input }: { input: { programInput: CreateProgramInput; userDetails?: PublicOnboardingUserDetails } }) => {
				const result = await createProgramAction(input.programInput, input.userDetails);
				if (!result.success) {
					throw new Error(result.error);
				}

				return result.data.programId;
			},
		),

		loadCandidateCounts: fromPromise(
			async ({
				input,
			}: {
				input: {
					countryId: string | null;
					focuses?: string[];
					profiles?: Profile[];
				};
			}) => {
				const [total, filtered] = await Promise.all([
					getCandidateCountAction([], [], input.countryId),
					getCandidateCountAction(input.focuses ?? [], input.profiles ?? [], input.countryId),
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
		loadBudgetPreview: fromPromise(
			async ({
				input,
			}: {
				input: {
					amountOfRecipients: number;
					programDuration: number;
					defaultPayoutPerInterval: number;
					payoutPerInterval: number;
					payoutInterval: PayoutInterval;
					payoutCurrency: Currency;
					displayCurrency: Currency;
				};
			}) => {
				const result = await calculateProgramBudgetAction(input);
				if (!result.success) {
					throw new Error(result.error);
				}

				return result.data;
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
			(context.recipientApproach === 'universal' || context.targetFocuses.length > 0 || context.targetProfiles.length > 0),

		// step 2 → step 3
		programSetupValidWithRecipients: ({ context }) =>
			Boolean(context.programManagement) &&
			Boolean(context.recipientApproach) &&
			context.filteredRecipients > 0 &&
			(context.recipientApproach === 'universal' || context.targetFocuses.length > 0 || context.targetProfiles.length > 0),

		// step 3
		budgetConfigValid: ({ context }) =>
			context.amountOfRecipients > 0 && context.programDuration > 0 && context.payoutPerInterval > 0,

		// step 3 → 4
		budgetConfigValidAndUnauthenticated: ({ context }) =>
			context.amountOfRecipients > 0 &&
			context.programDuration > 0 &&
			context.payoutPerInterval > 0 &&
			!context.isAuthenticated,
		contactEmailValid: ({ context }) => EMAIL_REGEX.test(context.contactEmail),
		contactNamesValid: ({ context }) =>
			context.contactFirstName.trim().length > 0 && context.contactLastName.trim().length > 0,
		accountDetailsValid: ({ context }) =>
			EMAIL_REGEX.test(context.contactEmail) &&
			context.contactFirstName.trim().length > 0 &&
			context.contactLastName.trim().length > 0,
		isAuthenticatedUser: ({ context }) => context.isAuthenticated,
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
		targetFocuses: [],
		focusOptions: [],
		targetProfiles: [],

		// step 3
		amountOfRecipients: 20,

		totalRecipients: 0,
		filteredRecipients: 0,
		isCountingRecipients: false,

		programDuration: 36,
		defaultPayoutPerInterval: 32,
		payoutPerInterval: 32,
		payoutInterval: 'monthly',
		payoutCurrency: 'USD',
		displayCurrency: 'CHF',
		calculatedTotalBudget: 23040,
		displayMonthlyCost: 640,
		exchangeRateText: undefined,
		totalBudgetTooltipText: "20 recipients x 32 USD payout per interval x 36 monthly intervals = 23'040 USD",
		payoutPerIntervalMin: 16,
		payoutPerIntervalMax: 64,
		isCalculatingBudget: false,
		customizePayouts: false,

		// step 4
		isAuthenticated: input?.isAuthenticated ?? false,
		contactEmail: '',
		contactFirstName: '',
		contactLastName: '',

		// meta
		createdProgramId: undefined,
		error: undefined,
	}),

	states: {
		//step 1
		countrySelection: {
			on: {
				SELECT_COUNTRY: {
					actions: assign(({ context, event }) => {
						const selectedCountryId = event.id;
						const selectedCountry = context.countries.find((country) => country.id === selectedCountryId);
						const payoutPerInterval = selectedCountry?.country.defaultPayoutAmount ?? context.payoutPerInterval;
						const defaultPayoutPerInterval =
							selectedCountry?.country.defaultPayoutAmount ?? context.defaultPayoutPerInterval;
						const payoutCurrency = selectedCountry?.country.currency ?? context.payoutCurrency;

						return {
							selectedCountryId,
							payoutPerInterval,
							defaultPayoutPerInterval,
							payoutCurrency,
						};
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
					focuses: context.recipientApproach === 'targeted' ? context.targetFocuses : [],
					profiles: context.recipientApproach === 'targeted' ? context.targetProfiles : [],
				}),
				onDone: {
					actions: assign(({ context, event }) => {
						const totalRecipients = event.output.total;
						const filteredRecipients = event.output.filtered;
						const amountOfRecipients =
							context.amountOfRecipients > filteredRecipients ? filteredRecipients : context.amountOfRecipients;

						return {
							totalRecipients,
							filteredRecipients,
							amountOfRecipients,
							isCountingRecipients: false,
						};
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
						targetFocuses: () => [],
						targetProfiles: () => [],
					}),
					target: 'programSetup',
					reenter: true,
				},
				TOGGLE_TARGET_FOCUS: {
					actions: assign({
						targetFocuses: ({ context, event }) =>
							context.targetFocuses.includes(event.focus)
								? context.targetFocuses.filter((f) => f !== event.focus)
								: [...context.targetFocuses, event.focus],
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
			entry: assign({ isCalculatingBudget: () => true }),
			invoke: {
				src: 'loadBudgetPreview',
				input: ({ context }) => ({
					amountOfRecipients: context.amountOfRecipients,
					programDuration: context.programDuration,
					defaultPayoutPerInterval: context.defaultPayoutPerInterval,
					payoutPerInterval: context.payoutPerInterval,
					payoutInterval: context.payoutInterval,
					payoutCurrency: context.payoutCurrency,
					displayCurrency: context.displayCurrency,
				}),
				onDone: {
					actions: assign(({ event }) => ({
						calculatedTotalBudget: event.output.calculatedTotalBudget,
						displayMonthlyCost: event.output.displayMonthlyCost,
						exchangeRateText: event.output.exchangeRateText,
						totalBudgetTooltipText: event.output.totalBudgetTooltipText,
						payoutPerIntervalMin: event.output.payoutPerIntervalMin,
						payoutPerIntervalMax: event.output.payoutPerIntervalMax,
						isCalculatingBudget: false,
					})),
				},
				onError: {
					target: 'error',
					actions: assign({
						error: ({ event }) => (event.error instanceof Error ? event.error.message : 'Failed to calculate budget'),
					}),
				},
			},
			on: {
				SET_AMOUNT_OF_RECIPIENTS: {
					actions: assign({ amountOfRecipients: ({ event }) => event.value }),
					target: 'budget',
					reenter: true,
				},
				TOGGLE_CUSTOMIZE_PAYOUTS: {
					actions: assign({ customizePayouts: ({ context }) => !context.customizePayouts }),
				},
				SET_PROGRAM_DURATION: {
					actions: assign({ programDuration: ({ event }) => event.value }),
					target: 'budget',
					reenter: true,
				},
				SET_PAYOUT_PER_INTERVAL: {
					actions: assign({ payoutPerInterval: ({ event }) => event.value }),
					target: 'budget',
					reenter: true,
				},
				SET_PAYOUT_INTERVAL: {
					actions: assign({ payoutInterval: ({ event }) => event.value }),
					target: 'budget',
					reenter: true,
				},
				SET_CURRENCY: {
					actions: assign({ displayCurrency: ({ event }) => event.value }),
					target: 'budget',
					reenter: true,
				},
				BACK: 'programSetup',
				NEXT: [
					{ guard: 'budgetConfigValidAndUnauthenticated', target: 'accountDetails' },
					{ guard: 'budgetConfigValid', target: 'saving' },
				],
				CLOSE: 'closed',
			},
		},

		// Step 4
		accountDetails: {
			on: {
				SET_CONTACT_EMAIL: {
					actions: assign({ contactEmail: ({ event }) => event.value.trim() }),
				},
				SET_CONTACT_FIRST_NAME: {
					actions: assign({ contactFirstName: ({ event }) => event.value }),
				},
				SET_CONTACT_LAST_NAME: {
					actions: assign({ contactLastName: ({ event }) => event.value }),
				},
				BACK: 'budget',
				NEXT: {
					guard: 'accountDetailsValid',
					target: 'saving',
				},
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
						countries: ({ event }) => event.output.countries,
						focusOptions: ({ event }) => event.output.focusOptions,
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
				input: ({ context }) => ({
					programInput: {
						countryId: context.selectedCountryId!,
						amountOfRecipientsForStart: context.amountOfRecipients,
						programDurationInMonths: context.programDuration,
						payoutPerInterval: context.payoutPerInterval,
						payoutInterval: context.payoutInterval,
						targetFocuses: context.targetFocuses,
						targetProfiles: context.targetProfiles,
					},
					userDetails: context.isAuthenticated
						? undefined
						: {
								email: context.contactEmail,
								firstName: context.contactFirstName,
								lastName: context.contactLastName,
							},
				}),
				onDone: [
					{
						guard: 'isAuthenticatedUser',
						actions: assign({ createdProgramId: ({ event }) => event.output }),
						target: 'closed',
					},
					{
						actions: assign({ createdProgramId: ({ event }) => event.output }),
						target: 'success',
					},
				],
				onError: {
					target: 'error',
					actions: assign({
						error: ({ event }) => (event.error instanceof Error ? event.error.message : 'Failed to create program'),
					}),
				},
			},
		},
		success: {
			on: {
				CLOSE: 'closed',
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
