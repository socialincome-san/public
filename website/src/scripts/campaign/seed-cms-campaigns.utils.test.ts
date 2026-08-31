import { Currency } from '@/generated/prisma/enums';
import {
	createDefaultCampaignSeedValues,
	normalizeCampaignPortalSlug,
	resolveProgramIdForCampaignSlug,
} from './seed-cms-campaigns.utils';

const programs = [
	{ id: 'program-si-core-sl', slug: 'sierra-leone-core-program' },
	{ id: 'program-si-education-sl', slug: 'skills-program' },
];

describe('seed-cms-campaigns.utils', () => {
	test('normalizeCampaignPortalSlug strips common campaign suffixes', () => {
		expect(normalizeCampaignPortalSlug('si-core-program-sl-default-campaign')).toBe('si-core-program-sl');
		expect(normalizeCampaignPortalSlug('skills-program-campaign')).toBe('skills-program');
	});

	test('resolveProgramIdForCampaignSlug matches by program slug substring', () => {
		expect(
			resolveProgramIdForCampaignSlug('skills-program-campaign', programs, 'program-si-core-sl'),
		).toEqual({
			programId: 'program-si-education-sl',
			matchedBy: 'slug',
		});
	});

	test('resolveProgramIdForCampaignSlug falls back to default program id', () => {
		expect(
			resolveProgramIdForCampaignSlug('unknown-campaign-slug', programs, 'program-si-core-sl'),
		).toEqual({
			programId: 'program-si-core-sl',
			matchedBy: 'default',
		});
	});

	test('createDefaultCampaignSeedValues uses CHF and end of next year', () => {
		const defaults = createDefaultCampaignSeedValues(new Date('2025-06-15T12:00:00.000Z'));

		expect(defaults.goal).toBe(25_000);
		expect(defaults.currency).toBe(Currency.CHF);
		expect(defaults.endDate).toEqual(new Date('2026-12-31T00:00:00.000Z'));
	});
});
