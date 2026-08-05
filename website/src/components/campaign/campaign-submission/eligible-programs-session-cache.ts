import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { getEligiblePublicSubmissionProgramsAction } from '@/lib/server-actions/campaign-public-actions';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';

type EligibleProgramsActionResult = Awaited<ReturnType<typeof getEligiblePublicSubmissionProgramsAction>>;

const inFlightByLang = new Map<WebsiteLanguage, Promise<EligibleProgramsActionResult>>();
const successByLang = new Map<WebsiteLanguage, PublicSubmissionProgramOption[]>();

export const peekCachedEligiblePublicSubmissionPrograms = (lang: WebsiteLanguage): PublicSubmissionProgramOption[] | null =>
	successByLang.get(lang) ?? null;

export const getCachedEligiblePublicSubmissionPrograms = async (
	lang: WebsiteLanguage,
): Promise<EligibleProgramsActionResult> => {
	const cached = successByLang.get(lang);
	if (cached) {
		return { success: true, data: cached };
	}

	const inFlight = inFlightByLang.get(lang);
	if (inFlight) {
		return inFlight;
	}

	const request = getEligiblePublicSubmissionProgramsAction(lang)
		.then((result) => {
			if (result.success) {
				successByLang.set(lang, result.data);
			}

			return result;
		})
		.finally(() => {
			inFlightByLang.delete(lang);
		});

	inFlightByLang.set(lang, request);

	return request;
};
