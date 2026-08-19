import { CountryCode } from '@/generated/prisma/enums';
import { CountryCondition, type ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import type { ProgramBudgetCalculation } from '@/lib/services/program-stats/program-stats.types';
import type { CreateProgramInput, PublicOnboardingUserDetails } from '@/lib/services/program/program.types';
import { createActor, fromPromise } from 'xstate';
import { createProgramWizardMachine } from './create-program-machine';

jest.mock('@/lib/server-actions/candidate-actions', () => ({
	getCandidateCountAction: jest.fn(),
}));
jest.mock('@/lib/server-actions/country-action', () => ({
	getProgramCountryFeasibilityAction: jest.fn(),
}));
jest.mock('@/lib/server-actions/focus-action', () => ({
	getFocusOptionsAction: jest.fn(),
}));
jest.mock('@/lib/server-actions/program-actions', () => ({
	createProgramAction: jest.fn(),
}));
jest.mock('@/lib/server-actions/program-stats-actions', () => ({
	calculateProgramBudgetAction: jest.fn(),
}));
jest.mock('@/lib/server-actions/session-actions', () => ({
	getIsAuthenticatedUserAction: jest.fn(),
}));

type SaveProgramInput = {
	programInput: CreateProgramInput;
	userDetails?: PublicOnboardingUserDetails;
};

const metFeasibility = {
	condition: CountryCondition.MET,
	details: { translationKey: 'met' },
};

const countryRow: ProgramCountryFeasibilityRow = {
	id: 'country-sl',
	country: {
		isoCode: CountryCode.SL,
		isActive: true,
		currency: 'USD',
		defaultPayoutAmount: 32,
	},
	stats: { programCount: 1, recipientCount: 1, candidateCount: 10 },
	cash: metFeasibility,
	mobileMoney: metFeasibility,
	mobileNetwork: metFeasibility,
	sanctions: metFeasibility,
};

const waitFor = async (predicate: () => boolean, timeoutMs = 2000) => {
	const startedAt = Date.now();
	while (!predicate()) {
		if (Date.now() - startedAt > timeoutMs) {
			throw new Error('Timed out waiting for condition');
		}
		await new Promise((resolve) => setTimeout(resolve, 10));
	}
};

type CreateWizardActorOptions = {
	isAuthenticated: boolean;
	resolvedIsAuthenticated?: boolean;
	onSave?: (input: SaveProgramInput) => void;
};

const createWizardActor = ({
	isAuthenticated,
	resolvedIsAuthenticated = isAuthenticated,
	onSave,
}: CreateWizardActorOptions) => {
	const machine = createProgramWizardMachine.provide({
		actors: {
			loadCountries: fromPromise(() =>
				Promise.resolve({
					countries: [countryRow],
					focusOptions: [] as { id: string; name: string }[],
					focusOptionsError: undefined as string | undefined,
					isAuthenticated: resolvedIsAuthenticated,
				}),
			),
			loadCandidateCounts: fromPromise(() =>
				Promise.resolve({
					total: 10,
					filtered: 10,
				}),
			),
			loadBudgetPreview: fromPromise((): Promise<ProgramBudgetCalculation> =>
				Promise.resolve({
					calculatedTotalBudget: 23040,
					displayMonthlyCost: 640,
					exchangeRateText: undefined,
					payoutToDisplayRate: 0.0417,
					totalBudgetTooltipText: 'tooltip',
					payoutPerIntervalMin: 16,
					payoutPerIntervalMax: 64,
				}),
			),
			saveProgram: fromPromise(({ input }: { input: SaveProgramInput }) => {
				onSave?.(input);

				return Promise.resolve('program-1');
			}),
		},
	});

	return createActor(machine, { input: { isAuthenticated } }).start();
};

const walkToBudget = async (actor: ReturnType<typeof createWizardActor>) => {
	actor.send({ type: 'OPEN' });
	await waitFor(() => actor.getSnapshot().matches('countrySelection'));

	actor.send({ type: 'SELECT_COUNTRY', id: 'country-sl' });
	actor.send({ type: 'NEXT' });
	await waitFor(() => actor.getSnapshot().matches('programSetup') && !actor.getSnapshot().context.isCountingRecipients);

	actor.send({ type: 'SELECT_RECIPIENT_APPROACH', value: 'universal' });
	await waitFor(() => actor.getSnapshot().matches('programSetup') && !actor.getSnapshot().context.isCountingRecipients);

	actor.send({ type: 'NEXT' });
	await waitFor(() => actor.getSnapshot().matches('budget') && !actor.getSnapshot().context.isCalculatingBudget);
};

describe('createProgramWizardMachine', () => {
	test('skips account details and omits userDetails when authenticated', async () => {
		let savedInput: SaveProgramInput | undefined;
		const actor = createWizardActor({
			isAuthenticated: true,
			onSave: (input) => {
				savedInput = input;
			},
		});

		await walkToBudget(actor);
		expect(actor.getSnapshot().context.payoutToDisplayRate).toBe(0.0417);
		actor.send({ type: 'NEXT' });

		await waitFor(() => actor.getSnapshot().matches('closed'));
		expect(savedInput?.userDetails).toBeUndefined();
		expect(savedInput?.programInput.countryId).toBe('country-sl');

		actor.stop();
	});

	test('goes to account details when unauthenticated', async () => {
		const actor = createWizardActor({ isAuthenticated: false });

		await walkToBudget(actor);
		actor.send({ type: 'NEXT' });

		expect(actor.getSnapshot().matches('accountDetails')).toBe(true);

		actor.stop();
	});

	test('skips account details when authentication is resolved on open', async () => {
		let savedInput: SaveProgramInput | undefined;
		const actor = createWizardActor({
			isAuthenticated: false,
			resolvedIsAuthenticated: true,
			onSave: (input) => {
				savedInput = input;
			},
		});

		await walkToBudget(actor);
		actor.send({ type: 'NEXT' });

		await waitFor(() => actor.getSnapshot().matches('closed'));
		expect(savedInput?.userDetails).toBeUndefined();

		actor.stop();
	});
});
