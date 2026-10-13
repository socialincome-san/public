import {
	activeCandidateFilters,
	canContinueCandidateSelection,
	clampCandidateQuantity,
	type CandidateSelectionApproach,
} from '@/components/candidate-selection/candidate-filters';
import { Currency, type Profile } from '@/generated/prisma/enums';
import type { ProgramBudgetCalculation, ProgramRecipientPoolSetup } from '@/modules/programs/program.types';

export type PoolErrorCode = 'load' | 'generic' | 'not_enough';

type AddRecipientsFromPoolStatus = 'loading' | 'error' | 'selection' | 'preview' | 'saving';

export type AddRecipientsFromPoolState = {
	status: AddRecipientsFromPoolStatus;
	approach: CandidateSelectionApproach | null;
	focusIds: string[];
	profiles: Profile[];
	localPartnerIds: string[];
	totalCount: number;
	matchingCount: number;
	isCounting: boolean;
	quantity: number;
	displayCurrency: Currency;
	budget: ProgramBudgetCalculation | null;
	isCalculatingBudget: boolean;
	error: PoolErrorCode | null;
	setup: ProgramRecipientPoolSetup | null;
};

export type AddRecipientsFromPoolAction =
	| { type: 'loadStarted' }
	| { type: 'setupLoaded'; setup: ProgramRecipientPoolSetup }
	| { type: 'setupFailed'; error: PoolErrorCode }
	| { type: 'selectApproach'; approach: CandidateSelectionApproach }
	| { type: 'toggleFocus'; focusId: string }
	| { type: 'toggleProfile'; profile: Profile }
	| { type: 'toggleLocalPartner'; localPartnerId: string }
	| { type: 'countsLoaded'; totalCount: number; matchingCount: number }
	| { type: 'countsFailed'; error: PoolErrorCode }
	| { type: 'continue' }
	| { type: 'back' }
	| { type: 'setQuantity'; quantity: number }
	| { type: 'setDisplayCurrency'; currency: Currency }
	| { type: 'budgetLoaded'; budget: ProgramBudgetCalculation }
	| { type: 'budgetFailed'; error: PoolErrorCode }
	| { type: 'submit' }
	| { type: 'submitFailed'; error: PoolErrorCode };

export const initialAddRecipientsFromPoolState: AddRecipientsFromPoolState = {
	status: 'loading',
	approach: null,
	focusIds: [],
	profiles: [],
	localPartnerIds: [],
	totalCount: 0,
	matchingCount: 0,
	isCounting: false,
	quantity: 1,
	displayCurrency: Currency.CHF,
	budget: null,
	isCalculatingBudget: false,
	error: null,
	setup: null,
};

const toggleValue = <T extends string>(values: T[], value: T): T[] =>
	values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

// A failed assignment stays visible while the recount and budget refresh behind it.
const keepNotEnoughError = (error: PoolErrorCode | null) => (error === 'not_enough' ? error : null);

const withCounting = (
	state: AddRecipientsFromPoolState,
	next: Partial<AddRecipientsFromPoolState>,
): AddRecipientsFromPoolState => ({
	...state,
	...next,
	isCounting: true,
	error: null,
	budget: null,
});

export const addRecipientsFromPoolReducer = (
	state: AddRecipientsFromPoolState,
	action: AddRecipientsFromPoolAction,
): AddRecipientsFromPoolState => {
	switch (action.type) {
		case 'loadStarted':
			return { ...initialAddRecipientsFromPoolState, status: 'loading' };
		case 'setupFailed':
			return { ...state, status: 'error', error: action.error, isCounting: false, isCalculatingBudget: false };
		case 'setupLoaded':
			return {
				...initialAddRecipientsFromPoolState,
				status: 'selection',
				setup: action.setup,
				totalCount: action.setup.totalCount,
				matchingCount: action.setup.totalCount,
				quantity: action.setup.totalCount > 0 ? 1 : 0,
			};
		case 'selectApproach':
			return withCounting(state, {
				approach: action.approach,
				focusIds: [],
				profiles: [],
				localPartnerIds: [],
			});
		case 'toggleFocus':
			return withCounting(state, { focusIds: toggleValue(state.focusIds, action.focusId) });
		case 'toggleProfile':
			return withCounting(state, { profiles: toggleValue(state.profiles, action.profile) });
		case 'toggleLocalPartner':
			return withCounting(state, { localPartnerIds: toggleValue(state.localPartnerIds, action.localPartnerId) });
		case 'countsLoaded':
			return {
				...state,
				isCounting: false,
				error: keepNotEnoughError(state.error),
				totalCount: action.totalCount,
				matchingCount: action.matchingCount,
				quantity: clampCandidateQuantity(state.quantity, action.matchingCount),
				...(state.status === 'preview' ? { isCalculatingBudget: true, budget: null } : {}),
			};
		case 'countsFailed':
			return { ...state, isCounting: false, error: action.error };
		case 'continue':
			if (
				!canContinueCandidateSelection({
					approach: state.approach,
					matchingCount: state.matchingCount,
					isCounting: state.isCounting,
				})
			) {
				return state;
			}

			return {
				...state,
				status: 'preview',
				error: null,
				isCalculatingBudget: true,
				quantity: clampCandidateQuantity(state.quantity, state.matchingCount),
			};
		case 'back':
			if (state.status === 'saving') {
				return state;
			}

			return { ...state, status: 'selection', error: null, isCalculatingBudget: false };
		case 'setQuantity':
			return {
				...state,
				quantity: clampCandidateQuantity(action.quantity, state.matchingCount),
				isCalculatingBudget: true,
				budget: null,
			};
		case 'setDisplayCurrency':
			return { ...state, displayCurrency: action.currency, isCalculatingBudget: true, budget: null };
		case 'budgetLoaded':
			return { ...state, budget: action.budget, isCalculatingBudget: false, error: keepNotEnoughError(state.error) };
		case 'budgetFailed':
			return { ...state, isCalculatingBudget: false, error: action.error };
		case 'submit':
			if (state.status === 'saving') {
				return state;
			}

			return { ...state, status: 'saving', error: null };
		case 'submitFailed':
			// The pool shrank since the last count, so recount to lower the quantity limit.
			return {
				...state,
				status: 'preview',
				isCalculatingBudget: false,
				isCounting: action.error === 'not_enough',
				error: action.error,
			};
	}
};

export const poolSelectionFilters = (state: AddRecipientsFromPoolState) =>
	activeCandidateFilters(state.approach, {
		focusIds: state.focusIds,
		profiles: state.profiles,
		localPartnerIds: state.localPartnerIds,
	});
