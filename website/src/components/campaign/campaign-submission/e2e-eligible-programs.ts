import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';

export const E2E_ELIGIBLE_CAMPAIGN_PROGRAMS_KEY = '__E2E_ELIGIBLE_CAMPAIGN_PROGRAMS__';

type E2EWindow = Window & {
	[E2E_ELIGIBLE_CAMPAIGN_PROGRAMS_KEY]?: PublicSubmissionProgramOption[];
};

export const getE2EMockEligibleCampaignPrograms = (): PublicSubmissionProgramOption[] | null => {
	if (typeof window === 'undefined') {
		return null;
	}

	const programs = (window as E2EWindow)[E2E_ELIGIBLE_CAMPAIGN_PROGRAMS_KEY];

	return Array.isArray(programs) ? programs : null;
};
