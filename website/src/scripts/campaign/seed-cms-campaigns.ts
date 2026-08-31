/**
 * Create missing local database campaigns for Storyblok CMS entries.
 *
 * Join key: Storyblok `content.portalSlug` ↔ database `campaign.slug`.
 * Create-only: skips campaigns that already exist in the database.
 *
 * Dry-run by default (exit 1 if anything would be created). Pass `--apply` to write.
 *
 * Usage (from website/):
 *   npm run db:seed:cms-campaigns              # dry-run
 *   npm run db:seed:cms-campaigns:apply        # create missing campaigns
 *   npm run db:seed:cms-campaigns:apply:all    # create all CMS campaigns (incl. unlisted)
 *   mise run seed-cms-campaigns                # create missing campaigns
 *   mise run seed-cms-campaigns-all            # create all CMS campaigns
 */

import '@/scripts/shared/load-script-env';
import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import { prisma } from '@/lib/database/prisma';
import { defaultLanguage } from '@/lib/i18n/utils';
import { getStoryblokApi } from '@/lib/services/storyblok/storyblok.config';
import { STORYBLOK_CAMPAIGNS_FOLDER } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/js';
import {
	assertDatabaseUrl,
	exitCodeForCreateOnlyScript,
	getDatabaseHost,
	log,
	parseBackfillCliOptions,
	printSummary,
} from '../shared/backfill-shared';
import {
	cmsCampaignSeedContributorId,
	createDefaultCampaignSeedValues,
	resolveProgramIdForCampaignSlug,
	type ProgramRef,
} from './seed-cms-campaigns.utils';

type Summary = {
	cmsCampaignsSeen: number;
	alreadyExists: number;
	campaignsCreated: number;
	skippedMissingPortalSlug: number;
	skippedUnlisted: number;
	errors: number;
};

const createSummary = (): Summary => ({
	cmsCampaignsSeen: 0,
	alreadyExists: 0,
	campaignsCreated: 0,
	skippedMissingPortalSlug: 0,
	skippedUnlisted: 0,
	errors: 0,
});

const isCampaignStory = (story: unknown): story is ISbStoryData<Campaign> => {
	if (!story || typeof story !== 'object' || !('content' in story)) {
		return false;
	}

	const { content } = story as { content?: unknown };
	if (!content || typeof content !== 'object') {
		return false;
	}

	const campaign = content as Campaign;

	return campaign.component?.toLowerCase() === 'campaign';
};

const isListedCampaignStory = (story: ISbStoryData<Campaign>) =>
	story.content.public === true && story.content.approved === true;

const fetchCampaignStories = async (version: ISbStoriesParams['version']) => {
	const stories = await getStoryblokApi().getAll('cdn/stories', {
		language: defaultLanguage,
		version,
		starts_with: `${STORYBLOK_CAMPAIGNS_FOLDER}/`,
	});

	return stories.filter(isCampaignStory);
};

const loadCmsCampaigns = async () => {
	let campaigns = await fetchCampaignStories('published');
	if (campaigns.length === 0) {
		campaigns = await fetchCampaignStories('draft');
	}

	return campaigns;
};

const parseProgramIdFlag = (argv: string[]): string | null => {
	const arg = argv.find((value) => value.startsWith('--program-id='));
	if (!arg) {
		return null;
	}

	const programId = arg.slice('--program-id='.length).trim();
	if (!programId) {
		throw new Error('Invalid --program-id value: expected a non-empty program id');
	}

	return programId;
};

const resolveDefaultProgramId = async (programs: ProgramRef[], overrideProgramId: string | null): Promise<string> => {
	if (overrideProgramId) {
		const programExists = programs.some((program) => program.id === overrideProgramId);
		if (!programExists) {
			throw new Error(`Program not found: ${overrideProgramId}`);
		}

		return overrideProgramId;
	}

	const fallbackCampaign = await prisma.campaign.findFirst({
		where: { isFallback: true },
		select: { programId: true },
	});
	if (fallbackCampaign) {
		return fallbackCampaign.programId;
	}

	const firstProgram = programs.at(0);
	if (!firstProgram) {
		throw new Error('No programs found in the database. Run `npm run db:seed` first.');
	}

	return firstProgram.id;
};

const printBanner = (options: {
	apply: boolean;
	listedOnly: boolean;
	defaultProgramId: string;
	contributorId: string;
}) => {
	log('=== CMS campaign database seed ===');
	log(`Mode: ${options.apply ? 'APPLY (writes enabled)' : 'DRY-RUN (no writes)'}`);
	log(`Database host: ${getDatabaseHost(process.env.DATABASE_URL ?? '')}`);
	log(`Campaign filter: ${options.listedOnly ? 'public + approved only' : 'all CMS campaign stories'}`);
	log(`Default program id: ${options.defaultProgramId}`);
	log(`Contributor id: ${options.contributorId}`);
	log('');
};

const main = async () => {
	assertDatabaseUrl();

	if (!process.env.STORYBLOK_PREVIEW_TOKEN) {
		throw new Error('Missing STORYBLOK_PREVIEW_TOKEN');
	}

	const argv = process.argv.slice(2);
	const { apply, limit } = parseBackfillCliOptions(argv);
	const listedOnly = !argv.includes('--all');
	const overrideProgramId = parseProgramIdFlag(argv);
	const summary = createSummary();

	const programs = await prisma.program.findMany({
		select: { id: true, slug: true },
		orderBy: { id: 'asc' },
	});
	const defaultProgramId = await resolveDefaultProgramId(programs, overrideProgramId);
	const seedDefaults = createDefaultCampaignSeedValues();

	const contributor = await prisma.contributor.findUnique({
		where: { id: cmsCampaignSeedContributorId },
		select: { id: true },
	});
	if (!contributor) {
		throw new Error(
			`Contributor not found: ${cmsCampaignSeedContributorId}. Run \`npm run db:seed\` first.`,
		);
	}

	printBanner({ apply, listedOnly, defaultProgramId, contributorId: cmsCampaignSeedContributorId });

	const cmsCampaigns = await loadCmsCampaigns();
	const campaignsToProcess = limit ? cmsCampaigns.slice(0, limit) : cmsCampaigns;

	for (const story of campaignsToProcess) {
		summary.cmsCampaignsSeen += 1;

		const portalSlug = story.content.portalSlug?.trim() ?? '';
		if (!portalSlug) {
			summary.skippedMissingPortalSlug += 1;
			log(`SKIP missing portalSlug: ${story.full_slug ?? story.slug}`);
			continue;
		}

		if (listedOnly && !isListedCampaignStory(story)) {
			summary.skippedUnlisted += 1;
			log(`SKIP unlisted campaign: ${portalSlug}`);
			continue;
		}

		const existingCampaign = await prisma.campaign.findUnique({
			where: { slug: portalSlug },
			select: { id: true },
		});
		if (existingCampaign) {
			summary.alreadyExists += 1;
			log(`EXISTS ${portalSlug}`);
			continue;
		}

		const { programId, matchedBy } = resolveProgramIdForCampaignSlug(portalSlug, programs, defaultProgramId);
		const title = story.content.title?.trim() || portalSlug;

		if (!apply) {
			summary.campaignsCreated += 1;
			log(`CREATE ${portalSlug} (${title}) -> program ${programId} [${matchedBy}]`);
			continue;
		}

		try {
			await prisma.campaign.create({
				data: {
					slug: portalSlug,
					goal: seedDefaults.goal,
					currency: seedDefaults.currency,
					endDate: seedDefaults.endDate,
					program: { connect: { id: programId } },
					contributor: { connect: { id: cmsCampaignSeedContributorId } },
				},
			});
			summary.campaignsCreated += 1;
			log(`CREATED ${portalSlug} (${title}) -> program ${programId} [${matchedBy}]`);
		} catch (error) {
			summary.errors += 1;
			log(`ERROR ${portalSlug}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	printSummary(summary);
	process.exitCode = exitCodeForCreateOnlyScript(
		{ errors: summary.errors, recordsToCreate: summary.campaignsCreated },
		apply,
	);
};

void main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
