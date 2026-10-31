import {
	exportAndRunStoryblokMarginMigration,
	fetchStoryblokReadOnly,
	resolveSafeOutputDirectory,
	type StoryblokReadOnlyClient,
	type StoryblokStorySummary,
	writeStoryblokMarginMigrationOutput,
} from '@/lib/storyblok/storyblok-margin-migration-export';
import { tmpdir } from 'os';
import { join } from 'path';

const managementEndpoint = 'https://mapi.storyblok.com/v1';
const cdnEndpoint = process.env.STORYBLOK_CDN_ENDPOINT?.trim() ?? 'https://api.storyblok.com/v2';

const getRequiredEnvironment = (name: string): string => {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`Missing ${name}.`);
	}

	return value;
};

const requestManagement = async (path: string): Promise<unknown> => {
	const response = await fetchStoryblokReadOnly(`${managementEndpoint}${path}`, {
		headers: { Authorization: getRequiredEnvironment('STORYBLOK_MANAGEMENT_TOKEN') },
		signal: AbortSignal.timeout(30_000),
	});
	const body: unknown = await response.json();
	if (!response.ok) {
		throw new Error(`Storyblok read request failed with status ${response.status}.`);
	}

	return body;
};

const requestManagementWithHeaders = async (path: string): Promise<{ body: unknown; headers: Headers }> => {
	const response = await fetchStoryblokReadOnly(`${managementEndpoint}${path}`, {
		headers: { Authorization: getRequiredEnvironment('STORYBLOK_MANAGEMENT_TOKEN') },
		signal: AbortSignal.timeout(30_000),
	});
	const body: unknown = await response.json();
	if (!response.ok) {
		throw new Error(`Storyblok read request failed with status ${response.status}.`);
	}

	return { body, headers: response.headers };
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const readStories = (body: unknown): Record<string, unknown>[] => {
	if (!isRecord(body) || !Array.isArray(body.stories) || !body.stories.every(isRecord)) {
		throw new Error('Storyblok returned an invalid stories page.');
	}

	return body.stories;
};

const toSummary = (story: Record<string, unknown>): StoryblokStorySummary => {
	if (typeof story.id !== 'number') {
		throw new Error('Storyblok returned a story without a numeric id.');
	}
	if (typeof story.uuid !== 'string' || !story.uuid.trim()) {
		throw new Error('Storyblok returned a story without a valid UUID.');
	}
	if (typeof story.slug !== 'string' || !story.slug.trim()) {
		throw new Error('Storyblok returned a story without a valid slug.');
	}

	return {
		id: story.id,
		uuid: story.uuid,
		slug: story.slug,
		...(typeof story.full_slug === 'string' ? { fullSlug: story.full_slug } : {}),
		...(typeof story.name === 'string' ? { name: story.name } : {}),
		isPublished: Boolean(story.published),
		hasUnpublishedChanges: Boolean(story.unpublished_changes),
	};
};

const createClient = (spaceId: string): StoryblokReadOnlyClient => ({
	getEnabledLanguages: async () => {
		const body = await requestManagement(`/spaces/${spaceId}`);
		if (!isRecord(body) || !isRecord(body.space) || !Array.isArray(body.space.languages)) {
			throw new Error('Storyblok space response did not contain a valid languages list.');
		}
		const languages = body.space.languages.flatMap((language) =>
			isRecord(language) && typeof language.code === 'string' ? [language.code] : [],
		);
		if (languages.length !== body.space.languages.length) {
			throw new Error('Storyblok space response contained an invalid language entry.');
		}

		return languages;
	},
	listStories: async (page, perPage) => {
		const response = await requestManagementWithHeaders(
			`/spaces/${spaceId}/stories/?page=${page}&per_page=${perPage}&sort_by=id:asc`,
		);
		const body = response.body;
		const headerTotal = Number(response.headers.get('total'));
		const headerPerPage = Number(response.headers.get('per_page'));
		if (!Number.isInteger(headerTotal) || !Number.isInteger(headerPerPage)) {
			throw new Error('Storyblok pagination headers did not contain valid total and per_page values.');
		}
		if (headerPerPage !== perPage) {
			throw new Error('Storyblok pagination headers returned an unexpected per_page value.');
		}

		return {
			stories: readStories(body).map(toSummary),
			total: headerTotal,
			responsePerPage: headerPerPage,
		};
	},
	getStoryDraft: async (summary) => {
		const body = await requestManagement(`/spaces/${spaceId}/stories/${summary.id}`);
		if (!isRecord(body) || !isRecord(body.story)) {
			throw new Error(`Storyblok did not return a valid story object for story ${summary.id}.`);
		}
		const story = body.story;

		return {
			story,
			metadata: {
				storyId: typeof story.id === 'number' ? story.id : summary.id,
				uuid: typeof story.uuid === 'string' ? story.uuid : summary.uuid,
				slug: typeof story.slug === 'string' ? story.slug : summary.slug,
				...(typeof story.full_slug === 'string' ? { fullSlug: story.full_slug } : {}),
				isPublished: Boolean(story.published),
				hasUnpublishedChanges: Boolean(story.unpublished_changes),
			},
		};
	},
	getPublishedStory: async (summary) => {
		const cdnToken = process.env.STORYBLOK_PREVIEW_TOKEN?.trim() ?? process.env.STORYBLOK_PUBLIC_TOKEN?.trim();
		if (!cdnToken) {
			return null;
		}

		const response = await fetchStoryblokReadOnly(
			`${cdnEndpoint}/cdn/stories/${summary.id}?version=published&token=${cdnToken}`,
			{ signal: AbortSignal.timeout(30_000) },
		);
		if (response.status === 404) {
			return null;
		}
		const body: unknown = await response.json();
		if (!response.ok || !isRecord(body) || !isRecord(body.story)) {
			throw new Error(`Storyblok CDN read request failed with status ${response.status}.`);
		}
		const story = body.story;

		return {
			story,
			metadata: {
				storyId: typeof story.id === 'number' ? story.id : summary.id,
				uuid: typeof story.uuid === 'string' ? story.uuid : summary.uuid,
				slug: typeof story.slug === 'string' ? story.slug : summary.slug,
				...(typeof story.full_slug === 'string' ? { fullSlug: story.full_slug } : {}),
			},
		};
	},
});

const parseLanguages = (): string[] | undefined => {
	const raw = process.env.STORYBLOK_MARGIN_MIGRATION_LANGUAGES?.trim();
	if (!raw) {
		return undefined;
	}
	const languages = raw
		.split(',')
		.map((language) => language.trim())
		.filter(Boolean);
	if (languages.length === 0) {
		throw new Error('STORYBLOK_MARGIN_MIGRATION_LANGUAGES was provided but contained no valid languages.');
	}

	return languages;
};

const main = async (): Promise<void> => {
	if (process.env.STORYBLOK_MARGIN_MIGRATION_ALLOW_LIVE_READ !== '1') {
		throw new Error('Live reads are disabled. Set STORYBLOK_MARGIN_MIGRATION_ALLOW_LIVE_READ=1 explicitly.');
	}
	if (process.env.STORYBLOK_MARGIN_MIGRATION_COVERAGE_CONFIRMED !== '1') {
		throw new Error(
			'Coverage is not proven automatically. Confirm the space language matrix and publication semantics before running live reads.',
		);
	}

	const outputDirectory =
		process.env.STORYBLOK_MARGIN_MIGRATION_OUTPUT_DIR?.trim() ??
		join(tmpdir(), `storyblok-margin-migration-${new Date().toISOString().replaceAll(':', '-')}`);
	const safeOutputDirectory = resolveSafeOutputDirectory(outputDirectory, process.cwd());
	const runId = safeOutputDirectory.split('/').at(-1) ?? 'storyblok-margin-migration';
	const result = await exportAndRunStoryblokMarginMigration({
		client: createClient(getRequiredEnvironment('STORYBLOK_SPACE_ID')),
		languages: parseLanguages(),
		runId,
	});

	await writeStoryblokMarginMigrationOutput(result, safeOutputDirectory);
	process.stdout.write(`Storyblok read-only dry run completed. Reports written to ${safeOutputDirectory}.\n`);
};

main().catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? error.message : 'Storyblok dry run failed.'}\n`);
	process.exitCode = 1;
});
