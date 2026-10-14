import type { Profile } from '@/generated/prisma/enums';

export type CandidateSelectionApproach = 'universal' | 'targeted';

export type CandidateSelectionFilters = {
	focusIds: string[];
	profiles: Profile[];
	localPartnerIds: string[];
};

export const activeCandidateFilters = (
	approach: CandidateSelectionApproach | null,
	selection: CandidateSelectionFilters,
): CandidateSelectionFilters => {
	if (approach !== 'targeted') {
		return { focusIds: [], profiles: [], localPartnerIds: [] };
	}

	return selection;
};

export const canContinueCandidateSelection = (input: {
	approach: CandidateSelectionApproach | null;
	matchingCount: number;
	isCounting: boolean;
}): boolean => input.approach !== null && !input.isCounting && input.matchingCount > 0;

export const clampCandidateQuantity = (quantity: number, matchingCount: number): number => {
	if (matchingCount < 1) {
		return 0;
	}

	return Math.min(matchingCount, Math.max(1, Math.round(quantity)));
};
