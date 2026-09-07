import { Currency } from '@/generated/prisma/enums';

/** Contributor linked to seed contribution `contribution-core-high-1`. */
export const cmsCampaignSeedContributorId = 'contributor-core-high';

export type ProgramRef = {
	id: string;
	slug: string | null;
};

export type CampaignSeedDefaults = {
	goal: number;
	currency: Currency;
	endDate: Date;
};

const CAMPAIGN_SLUG_SUFFIXES = ['-default-campaign', '-campaign'] as const;

export const normalizeCampaignPortalSlug = (portalSlug: string) => {
	let normalized = portalSlug.trim().toLowerCase();
	for (const suffix of CAMPAIGN_SLUG_SUFFIXES) {
		if (normalized.endsWith(suffix)) {
			normalized = normalized.slice(0, -suffix.length);
		}
	}

	return normalized;
};

export const resolveProgramIdForCampaignSlug = (
	portalSlug: string,
	programs: ProgramRef[],
	defaultProgramId: string,
): { programId: string; matchedBy: 'slug' | 'default' } => {
	const normalizedCampaignSlug = normalizeCampaignPortalSlug(portalSlug);

	let bestMatch: ProgramRef | undefined;
	let bestScore = 0;

	for (const program of programs) {
		const programSlug = program.slug?.trim().toLowerCase();
		if (!programSlug) {
			continue;
		}

		const matches =
			normalizedCampaignSlug.includes(programSlug) ||
			programSlug.includes(normalizedCampaignSlug) ||
			normalizedCampaignSlug.includes(program.id.replace(/^program-/, ''));
		if (!matches) {
			continue;
		}

		if (programSlug.length > bestScore) {
			bestScore = programSlug.length;
			bestMatch = program;
		}
	}

	if (bestMatch) {
		return { programId: bestMatch.id, matchedBy: 'slug' };
	}

	return { programId: defaultProgramId, matchedBy: 'default' };
};

export const createDefaultCampaignSeedValues = (referenceDate = new Date()): CampaignSeedDefaults => ({
	goal: 25_000,
	currency: Currency.CHF,
	endDate: new Date(Date.UTC(referenceDate.getUTCFullYear() + 1, 11, 31)),
});
