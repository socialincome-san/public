import { createHash, randomUUID } from 'crypto';
import { existsSync, realpathSync } from 'fs';
import { mkdir, rename, rm, writeFile } from 'fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'path';
import { runStoryblokMarginMigrationDryRun, type StoryblokMarginMigrationReport } from './storyblok-margin-migration';

export type StoryblokStorySummary = {
	id: number;
	uuid: string;
	slug: string;
	fullSlug?: string;
	name?: string;
	isPublished: boolean;
	hasUnpublishedChanges: boolean;
};

type StoryblokDraftStoryResponse = {
	story: Record<string, unknown>;
	metadata: {
		storyId: number;
		uuid: string;
		slug?: string;
		fullSlug?: string;
		isPublished?: boolean;
		hasUnpublishedChanges?: boolean;
	};
};

type StoryblokPublishedStoryResponse = {
	story: Record<string, unknown>;
	metadata: {
		storyId: number;
		uuid: string;
		slug?: string;
		fullSlug?: string;
	};
};

export type StoryblokStorySnapshot = {
	storyId: number;
	uuid: string;
	slug: string;
	fullSlug?: string;
	name?: string;
	isPublished: boolean;
	hasUnpublishedChanges: boolean;
	publicationStatus: 'draft-only' | 'published' | 'published-with-unpublished-changes';
	retrievedAt: string;
	draftContentHash: string;
	draftStory: Record<string, unknown>;
	publishedContentHash?: string;
	publishedContentMatchesDraft?: boolean;
	publishedStory?: Record<string, unknown>;
};

export type StoryblokMigrationProposal = {
	storyId: number;
	uuid: string;
	slug: string;
	fullSlug?: string;
	publish: boolean;
	hasUnpublishedChanges: boolean;
	story: Record<string, unknown>;
};

type StoryblokMarginMigrationManifest = {
	schemaVersion: 1;
	runId: string;
	retrievedAt: string;
	spaceLanguages: string[];
	coverage: {
		languageSource: 'space-configuration';
		authoritativeLanguageListVerified: true;
		complete: boolean;
		limitations: string[];
	};
	completion: 'complete' | 'completed-with-unproven-coverage' | 'failed';
	storyCount: number;
	snapshotCount: number;
	counts: {
		draftOnly: number;
		published: number;
		publishedWithUnpublishedChanges: number;
	};
	pages: StoryblokPageManifest[];
	snapshots: {
		storyId: number;
		uuid: string;
		slug: string;
		publicationStatus: 'draft-only' | 'published' | 'published-with-unpublished-changes';
		draftContentHash: string;
		publishedContentHash?: string;
		retrievedAt: string;
	}[];
	failures: StoryblokMarginMigrationFailure[];
};

export type StoryblokMarginMigrationExport = {
	manifest: StoryblokMarginMigrationManifest;
	snapshots: StoryblokStorySnapshot[];
	proposedStories: StoryblokMigrationProposal[];
	failures: StoryblokMarginMigrationFailure[];
	report: StoryblokMarginMigrationReport;
};

type StoryblokPageManifest = {
	page: number;
	requestedPerPage: number;
	returnedCount: number;
	total: number;
	ids: number[];
	responsePage?: number;
	responsePerPage?: number;
};

type StoryblokMarginMigrationFailure = {
	storyId?: number;
	uuid?: string;
	message: string;
};

export type StoryblokReadOnlyClient = {
	getEnabledLanguages: () => Promise<string[]>;
	listStories: (
		page: number,
		perPage: number,
	) => Promise<{
		stories: StoryblokStorySummary[];
		total: number;
		responsePage?: number;
		responsePerPage?: number;
	}>;
	getStoryDraft: (summary: StoryblokStorySummary) => Promise<StoryblokDraftStoryResponse>;
	getPublishedStory?: (summary: StoryblokStorySummary) => Promise<StoryblokPublishedStoryResponse | null>;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const stableJson = (value: unknown): string => {
	if (Array.isArray(value)) {
		return `[${value.map(stableJson).join(',')}]`;
	}
	if (!isRecord(value)) {
		return JSON.stringify(value);
	}

	return `{${Object.entries(value)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([key, child]) => `${JSON.stringify(key)}:${stableJson(child)}`)
		.join(',')}}`;
};

export const hashStory = (story: Record<string, unknown>): string =>
	createHash('sha256').update(stableJson(story)).digest('hex');

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const parseRetryAfter = (value: string | null): number | undefined => {
	if (!value) {
		return undefined;
	}
	const seconds = Number(value);
	if (Number.isFinite(seconds) && seconds >= 0) {
		return seconds * 1000;
	}
	const date = Date.parse(value);

	return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
};

export const fetchStoryblokReadOnly = async (
	input: RequestInfo | URL,
	init: RequestInit,
	fetchImplementation: typeof fetch = fetch,
): Promise<Response> => {
	const maxAttempts = 3;
	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		try {
			const response = await fetchImplementation(input, { ...init, method: 'GET' });
			if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === maxAttempts) {
				return response;
			}
			const delay = parseRetryAfter(response.headers.get('retry-after')) ?? 2 ** (attempt - 1) * 250;
			await new Promise((resolveDelay) => setTimeout(resolveDelay, Math.min(delay, 5_000)));
		} catch (error) {
			if (attempt === maxAttempts) {
				throw error;
			}
			await new Promise((resolveDelay) => setTimeout(resolveDelay, 2 ** (attempt - 1) * 250));
		}
	}

	throw new Error('Storyblok read request retry loop ended unexpectedly.');
};

const assertSummaryIdentity = (
	summary: StoryblokStorySummary,
	metadata: {
		storyId: number;
		uuid: string;
		slug?: string;
		fullSlug?: string;
		isPublished?: boolean;
		hasUnpublishedChanges?: boolean;
	},
): void => {
	if (metadata.storyId !== summary.id) {
		throw new Error(`Storyblok returned story identity ${metadata.storyId} for requested story ${summary.id}.`);
	}
	if (metadata.uuid !== summary.uuid) {
		throw new Error(`Storyblok returned UUID ${metadata.uuid} for requested story ${summary.uuid}.`);
	}
	if (metadata.slug !== undefined && summary.slug !== undefined && metadata.slug !== summary.slug) {
		throw new Error(`Storyblok returned slug ${metadata.slug} for requested story ${summary.slug}.`);
	}
	if (metadata.fullSlug !== undefined && summary.fullSlug !== undefined && metadata.fullSlug !== summary.fullSlug) {
		throw new Error(`Storyblok returned full slug ${metadata.fullSlug} for requested story ${summary.fullSlug}.`);
	}
	if (metadata.isPublished !== undefined && metadata.isPublished !== summary.isPublished) {
		throw new Error(
			`Storyblok returned isPublished=${metadata.isPublished} for requested story ${summary.id} (enumerated as ${summary.isPublished}).`,
		);
	}
	if (metadata.hasUnpublishedChanges !== undefined && metadata.hasUnpublishedChanges !== summary.hasUnpublishedChanges) {
		throw new Error(
			`Storyblok returned hasUnpublishedChanges=${metadata.hasUnpublishedChanges} for requested story ${summary.id} (enumerated as ${summary.hasUnpublishedChanges}).`,
		);
	}
};

export const selectSuccessfulProposals = (
	report: StoryblokMarginMigrationReport,
	snapshots: StoryblokStorySnapshot[],
): StoryblokMigrationProposal[] => {
	const proposals: StoryblokMigrationProposal[] = [];
	for (const [index, result] of report.stories.entries()) {
		if (result.status === 'failed') {
			continue;
		}
		const snapshot = snapshots[index];
		const proposedStory = report.proposedStories[index];
		if (snapshot && isRecord(proposedStory)) {
			proposals.push({
				storyId: snapshot.storyId,
				uuid: snapshot.uuid,
				slug: snapshot.slug,
				...(snapshot.fullSlug ? { fullSlug: snapshot.fullSlug } : {}),
				publish: snapshot.isPublished && !snapshot.hasUnpublishedChanges,
				hasUnpublishedChanges: snapshot.hasUnpublishedChanges,
				story: proposedStory,
			});
		}
	}

	return proposals;
};

export const exportAndRunStoryblokMarginMigration = async (options: {
	client: StoryblokReadOnlyClient;
	languages?: readonly string[];
	perPage?: number;
	runId: string;
	retrievedAt?: string;
}): Promise<StoryblokMarginMigrationExport> => {
	const enabledLanguages = [
		...new Set((await options.client.getEnabledLanguages()).map((language) => language.trim()).filter(Boolean)),
	];
	if (enabledLanguages.length === 0) {
		throw new Error('Space configuration returned an empty languages list.');
	}

	if (options.languages !== undefined) {
		const requestedLanguages = [...new Set(options.languages.map((language) => language.trim()).filter(Boolean))];
		if (requestedLanguages.length === 0) {
			throw new Error('At least one Storyblok language is required when languages are explicitly provided.');
		}
		if (
			requestedLanguages.some((language) => !enabledLanguages.includes(language)) ||
			enabledLanguages.some((language) => !requestedLanguages.includes(language))
		) {
			throw new Error('Requested Storyblok languages do not match the configured space languages.');
		}
	}

	const perPage = options.perPage ?? 100;
	if (!Number.isInteger(perPage) || perPage < 1) {
		throw new Error('Storyblok pagination perPage must be a positive integer.');
	}

	const storySummaries: StoryblokStorySummary[] = [];
	const storyIds = new Set<number>();
	const storyUuids = new Set<string>();
	const pages: StoryblokPageManifest[] = [];
	let total: number | undefined;
	let page = 1;
	while (total === undefined || storySummaries.length < total) {
		const response = await options.client.listStories(page, perPage);
		if (!isRecord(response) || !Array.isArray(response.stories)) {
			throw new Error(`Storyblok returned an invalid stories page for page ${page}.`);
		}
		if (!Number.isInteger(response.total) || response.total < 0) {
			throw new Error(`Storyblok returned an invalid total for page ${page}.`);
		}
		if (response.responsePage !== undefined && response.responsePage !== page) {
			throw new Error(`Storyblok returned page ${response.responsePage} for requested page ${page}.`);
		}
		if (response.responsePerPage !== undefined && response.responsePerPage !== perPage) {
			throw new Error(`Storyblok returned per_page ${response.responsePerPage} for requested ${perPage}.`);
		}
		if (total === undefined) {
			total = response.total;
		} else if (response.total !== total) {
			throw new Error('Storyblok story total changed during pagination.');
		}

		if (response.stories.length === 0 && storySummaries.length < total) {
			throw new Error(`Storyblok returned an incomplete page ${page}.`);
		}

		const pageStoryIds: number[] = [];
		for (const story of response.stories) {
			if (!isRecord(story)) {
				throw new Error(`Storyblok returned an invalid story summary on page ${page}.`);
			}
			if (!Number.isInteger(story.id)) {
				throw new Error(`Storyblok returned a story without a numeric identity on page ${page}.`);
			}
			if (typeof story.uuid !== 'string' || !story.uuid.trim()) {
				throw new Error(`Storyblok returned a story without a valid UUID on page ${page}.`);
			}
			if (typeof story.slug !== 'string' || !story.slug.trim()) {
				throw new Error(`Storyblok returned a story without a valid slug on page ${page}.`);
			}
			if (typeof story.isPublished !== 'boolean' || typeof story.hasUnpublishedChanges !== 'boolean') {
				throw new Error(`Storyblok returned a story without publication flags on page ${page}.`);
			}
			if (storyIds.has(story.id)) {
				throw new Error(`Storyblok returned duplicate story identity ${story.id}.`);
			}
			if (storyUuids.has(story.uuid)) {
				throw new Error(`Storyblok returned duplicate story UUID ${story.uuid}.`);
			}
			storyIds.add(story.id);
			storyUuids.add(story.uuid);
			pageStoryIds.push(story.id);
			storySummaries.push(story);
		}

		pages.push({
			page,
			requestedPerPage: perPage,
			returnedCount: response.stories.length,
			total: response.total,
			ids: pageStoryIds,
			...(response.responsePage !== undefined ? { responsePage: response.responsePage } : {}),
			...(response.responsePerPage !== undefined ? { responsePerPage: response.responsePerPage } : {}),
		});

		if (storySummaries.length > total) {
			throw new Error('Storyblok returned more stories than its reported total.');
		}
		if (storySummaries.length === total) {
			break;
		}
		if (response.stories.length < perPage) {
			throw new Error(`Storyblok page ${page} ended before the reported total was reached.`);
		}
		page += 1;
	}

	const retrievedAt = options.retrievedAt ?? new Date().toISOString();
	const snapshots: StoryblokStorySnapshot[] = [];
	const failures: StoryblokMarginMigrationFailure[] = [];
	const limitations: string[] = [
		'The exporter verifies configured space languages against space configuration.',
		'Pagination identity checks cannot rule out a unique replacement story hiding an omitted story when the API provides no stable enumeration snapshot.',
	];
	let coverageComplete = true;

	for (const summary of storySummaries) {
		const draftResponse = await options.client.getStoryDraft(summary);
		if (!isRecord(draftResponse) || !isRecord(draftResponse.story)) {
			throw new Error(`Storyblok returned an invalid draft story response for story ${summary.id}.`);
		}
		assertSummaryIdentity(summary, draftResponse.metadata);
		const draftStory = draftResponse.story;
		const draftContentHash = hashStory(draftStory);

		let publicationStatus: 'draft-only' | 'published' | 'published-with-unpublished-changes';
		let publishedStory: Record<string, unknown> | undefined;
		let publishedContentHash: string | undefined;
		let publishedContentMatchesDraft: boolean | undefined;

		if (!summary.isPublished) {
			publicationStatus = 'draft-only';
		} else if (!summary.hasUnpublishedChanges) {
			publicationStatus = 'published';
			publishedStory = draftStory;
			publishedContentHash = draftContentHash;
			publishedContentMatchesDraft = true;
		} else {
			publicationStatus = 'published-with-unpublished-changes';
			limitations.push(
				`Story ${summary.id} (${summary.slug}) has unpublished changes; publishing draft migration would publish pending edits.`,
			);

			if (options.client.getPublishedStory) {
				const publishedResponse = await options.client.getPublishedStory(summary);
				if (publishedResponse && isRecord(publishedResponse.story)) {
					assertSummaryIdentity(summary, publishedResponse.metadata);
					publishedStory = publishedResponse.story;
					publishedContentHash = hashStory(publishedStory);
					publishedContentMatchesDraft = publishedContentHash === draftContentHash;
				} else {
					coverageComplete = false;
					limitations.push(`Published snapshot for story ${summary.id} could not be retrieved or verified.`);
				}
			} else {
				coverageComplete = false;
				limitations.push(`No published story fetcher configured for story ${summary.id} with unpublished changes.`);
			}
		}

		snapshots.push({
			storyId: summary.id,
			uuid: summary.uuid,
			slug: summary.slug,
			...(summary.fullSlug ? { fullSlug: summary.fullSlug } : {}),
			...(summary.name ? { name: summary.name } : {}),
			isPublished: summary.isPublished,
			hasUnpublishedChanges: summary.hasUnpublishedChanges,
			publicationStatus,
			retrievedAt,
			draftContentHash,
			draftStory,
			...(publishedContentHash ? { publishedContentHash } : {}),
			...(publishedContentMatchesDraft !== undefined ? { publishedContentMatchesDraft } : {}),
			...(publishedStory ? { publishedStory } : {}),
		});
	}

	const report = runStoryblokMarginMigrationDryRun(
		snapshots.map(({ draftStory, storyId, uuid, slug, publicationStatus }) => ({
			...draftStory,
			id: storyId,
			uuid,
			slug,
			version: publicationStatus,
		})),
	);

	for (const [index, result] of report.stories.entries()) {
		if (result.status === 'failed') {
			failures.push({
				storyId: snapshots[index]?.storyId,
				uuid: snapshots[index]?.uuid,
				message: result.errors.map(({ message }) => message).join('; '),
			});
		}
	}

	const proposedStories = selectSuccessfulProposals(report, snapshots);
	if (failures.length > 0 || snapshots.length !== storySummaries.length) {
		coverageComplete = false;
	}

	const counts = {
		draftOnly: snapshots.filter(({ publicationStatus }) => publicationStatus === 'draft-only').length,
		published: snapshots.filter(({ publicationStatus }) => publicationStatus === 'published').length,
		publishedWithUnpublishedChanges: snapshots.filter(
			({ publicationStatus }) => publicationStatus === 'published-with-unpublished-changes',
		).length,
	};

	const manifest: StoryblokMarginMigrationManifest = {
		schemaVersion: 1,
		runId: options.runId,
		retrievedAt,
		spaceLanguages: enabledLanguages,
		coverage: {
			languageSource: 'space-configuration',
			authoritativeLanguageListVerified: true,
			complete: coverageComplete,
			limitations,
		},
		completion:
			failures.length === 0 && coverageComplete
				? 'complete'
				: failures.length === 0
					? 'completed-with-unproven-coverage'
					: 'failed',
		storyCount: snapshots.length,
		snapshotCount: snapshots.length,
		counts,
		pages,
		snapshots: snapshots.map(
			({ storyId, uuid, slug, publicationStatus, draftContentHash, publishedContentHash, retrievedAt: time }) => ({
				storyId,
				uuid,
				slug,
				publicationStatus,
				draftContentHash,
				...(publishedContentHash ? { publishedContentHash } : {}),
				retrievedAt: time,
			}),
		),
		failures,
	};

	return {
		manifest,
		snapshots,
		proposedStories,
		failures,
		report,
	};
};

export const resolveSafeOutputDirectory = (outputDirectory: string, repositoryRoot: string): string => {
	const resolvedOutput = resolve(outputDirectory);
	const resolvedRoot = resolve(repositoryRoot);
	const pathFromRoot = relative(resolvedRoot, resolvedOutput);
	if (pathFromRoot === '' || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..' && !isAbsolute(pathFromRoot))) {
		throw new Error('Output directory must be outside the repository working tree.');
	}
	if (existsSync(resolvedOutput)) {
		throw new Error('Output directory already exists; refusing to overwrite snapshots.');
	}
	if (!existsSync(dirname(resolvedOutput))) {
		throw new Error('Output directory parent does not exist; refusing to create an unverified path.');
	}
	const resolvedParent = realpathSync(dirname(resolvedOutput));
	const parentFromRoot = relative(resolvedRoot, resolvedParent);
	if (
		parentFromRoot === '' ||
		(!parentFromRoot.startsWith(`..${sep}`) && parentFromRoot !== '..' && !isAbsolute(parentFromRoot))
	) {
		throw new Error('Output directory parent resolves inside the repository working tree.');
	}

	return resolvedOutput;
};

export const writeStoryblokMarginMigrationOutput = async (
	result: StoryblokMarginMigrationExport,
	outputDirectory: string,
): Promise<void> => {
	const payloads = new Map([
		['manifest.json', `${JSON.stringify(result.manifest, null, 2)}\n`],
		['snapshots.json', `${JSON.stringify(result.snapshots, null, 2)}\n`],
		['migration-report.json', `${JSON.stringify({ ...result.report, proposedStories: undefined }, null, 2)}\n`],
		['proposed-stories.json', `${JSON.stringify(result.proposedStories, null, 2)}\n`],
	]);
	const temporaryDirectory = `${outputDirectory}.tmp-${randomUUID()}`;
	try {
		await mkdir(temporaryDirectory);
		await Promise.all([...payloads].map(([name, content]) => writeFile(resolve(temporaryDirectory, name), content)));
		await rename(temporaryDirectory, outputDirectory);
	} catch (error) {
		await rm(temporaryDirectory, { recursive: true, force: true });
		throw error;
	}
};
