export const STORYBLOK_MARGIN_COMPONENTS = [
	'donationsTotal',
	'explainerVideoHeader',
	'faqSelection',
	'imageText',
	'journalTeasers',
	'modalCards',
	'personGrid',
	'programGrid',
	'richtextButtonHeader',
	'testimonialCarousel',
	'text',
	'twoColumn',
	'twoColumnText',
] as const;

type AffectedComponent = (typeof STORYBLOK_MARGIN_COMPONENTS)[number];
type MarginField = 'marginTop' | 'marginBottom';

export type StoryblokMarginAuditChange = {
	storyIdentifier?: string | number;
	slug?: string;
	language?: string;
	version?: string;
	component: AffectedComponent;
	path: string;
	field: MarginField;
	previousValue: unknown;
	newValue: 'none';
	reason: string;
};

export type StoryblokMarginSkippedBlock = {
	storyIdentifier?: string | number;
	slug?: string;
	language?: string;
	version?: string;
	component: AffectedComponent;
	path: string;
	reason: string;
};

export type StoryblokMarginMigrationError = {
	storyIndex?: number;
	path?: string;
	message: string;
};

export type StoryblokMarginStoryResult = StoryMetadata & {
	storyIndex: number;
	status: 'success' | 'failed';
	changes: StoryblokMarginAuditChange[];
	skippedBlocks: StoryblokMarginSkippedBlock[];
	errors: StoryblokMarginMigrationError[];
};

export type StoryblokMarginMigrationReport = {
	proposedStories: unknown[];
	stories: StoryblokMarginStoryResult[];
	changes: StoryblokMarginAuditChange[];
	skippedBlocks: StoryblokMarginSkippedBlock[];
	errors: StoryblokMarginMigrationError[];
	summary: {
		storiesInspected: number;
		affectedStories: number;
		affectedBlocks: number;
		changesByMarginSide: Record<MarginField, number>;
		unchangedBlocks: number;
		errorCount: number;
	};
};

export type SerializedStoryblokMarginMigrationReport = {
	schemaVersion: 1;
	runId: string;
	summary: StoryblokMarginMigrationReport['summary'];
	stories: StoryblokMarginStoryResult[];
};

type StoryMetadata = {
	storyIdentifier?: string | number;
	slug?: string;
	language?: string;
	version?: string;
};

type MutableRecord = Record<string, unknown>;
type TraversalError = Error & { path: string };

const affectedComponents = new Set<string>(STORYBLOK_MARGIN_COMPONENTS);
const isRecord = (value: unknown): value is MutableRecord => typeof value === 'object' && value !== null;
const isEmptyMargin = (value: unknown): boolean => value === undefined || value === null || value === '';
const isAffectedComponent = (value: unknown): value is AffectedComponent =>
	typeof value === 'string' && affectedComponents.has(value);

const getMetadata = (story: MutableRecord): StoryMetadata => ({
	...(typeof story.id === 'string' || typeof story.id === 'number'
		? { storyIdentifier: story.id }
		: typeof story.uuid === 'string'
			? { storyIdentifier: story.uuid }
			: {}),
	...(typeof story.slug === 'string' ? { slug: story.slug } : {}),
	...(typeof story.language === 'string' ? { language: story.language } : {}),
	...(typeof story.version === 'string' ? { version: story.version } : {}),
});

const formatPath = (path: string, key: string | number): string =>
	typeof key === 'number' ? `${path}[${key}]` : `${path}.${key}`;

const createTraversalError = (path: string, message: string): TraversalError => {
	return Object.assign(new Error(message), { path });
};

const isTraversalError = (error: unknown): error is TraversalError =>
	error instanceof Error && 'path' in error && typeof error.path === 'string';

const sortKeys = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(sortKeys);
	}
	if (!isRecord(value)) {
		return value;
	}

	return Object.fromEntries(
		Object.entries(value)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, child]) => [key, sortKeys(child)]),
	);
};

const cloneAndTransform = (
	value: unknown,
	path: string,
	metadata: StoryMetadata,
	changes: StoryblokMarginAuditChange[],
	skippedBlocks: StoryblokMarginSkippedBlock[],
	affectedBlockPaths: Set<string>,
	active: WeakSet<object>,
): unknown => {
	if (!isRecord(value)) {
		return value;
	}
	if (active.has(value)) {
		throw createTraversalError(path, `Circular value encountered at ${path}`);
	}

	active.add(value);
	try {
		if (Array.isArray(value)) {
			return value.map((item, index) =>
				cloneAndTransform(item, formatPath(path, index), metadata, changes, skippedBlocks, affectedBlockPaths, active),
			);
		}

		const clone: MutableRecord = {};
		for (const [key, child] of Object.entries(value)) {
			clone[key] = cloneAndTransform(
				child,
				formatPath(path, key),
				metadata,
				changes,
				skippedBlocks,
				affectedBlockPaths,
				active,
			);
		}

		if (!isAffectedComponent(value.component)) {
			return clone;
		}

		const component = value.component;
		let changed = false;
		for (const field of ['marginTop', 'marginBottom'] as const) {
			const legacyField = field === 'marginTop' ? 'disableMarginTop' : 'disableMarginBottom';
			if (isEmptyMargin(value[field]) && value[legacyField] === true) {
				clone[field] = 'none';
				changes.push({
					...metadata,
					component,
					path,
					field,
					previousValue: value[field],
					newValue: 'none',
					reason: `${legacyField} is true and ${field} is empty`,
				});
				changed = true;
			}
		}

		if (changed) {
			affectedBlockPaths.add(path);
		}

		if (!changed) {
			skippedBlocks.push({
				...metadata,
				component,
				path,
				reason: 'No empty margin field has a corresponding true legacy flag',
			});
		}

		return clone;
	} finally {
		active.delete(value);
	}
};

export const runStoryblokMarginMigrationDryRun = (stories: unknown): StoryblokMarginMigrationReport => {
	const changes: StoryblokMarginAuditChange[] = [];
	const skippedBlocks: StoryblokMarginSkippedBlock[] = [];
	const errors: StoryblokMarginMigrationError[] = [];
	const proposedStories: unknown[] = [];
	const storyResults: StoryblokMarginStoryResult[] = [];

	if (!Array.isArray(stories)) {
		return {
			proposedStories,
			stories: [],
			changes,
			skippedBlocks,
			errors: [{ message: 'Input must be an array of Storyblok story payloads.' }],
			summary: {
				storiesInspected: 0,
				affectedStories: 0,
				affectedBlocks: 0,
				changesByMarginSide: { marginTop: 0, marginBottom: 0 },
				unchangedBlocks: 0,
				errorCount: 1,
			},
		};
	}

	const affectedStoryIndexes = new Set<number>();
	let affectedBlocks = 0;
	for (const [storyIndex, story] of stories.entries()) {
		if (!isRecord(story) || Array.isArray(story)) {
			const error = { storyIndex, message: 'Story payload must be an object.' };
			errors.push(error);
			storyResults.push({ storyIndex, status: 'failed', changes: [], skippedBlocks: [], errors: [error] });
			proposedStories.push(story);
			continue;
		}

		const metadata = getMetadata(story);
		const storyChanges: StoryblokMarginAuditChange[] = [];
		const storySkippedBlocks: StoryblokMarginSkippedBlock[] = [];
		const storyAffectedBlockPaths = new Set<string>();
		const storyPath = `$[${storyIndex}]`;
		try {
			proposedStories.push(
				cloneAndTransform(
					story,
					storyPath,
					getMetadata(story),
					storyChanges,
					storySkippedBlocks,
					storyAffectedBlockPaths,
					new WeakSet<object>(),
				),
			);
			changes.push(...storyChanges);
			skippedBlocks.push(...storySkippedBlocks);
			affectedBlocks += storyAffectedBlockPaths.size;
			if (storyChanges.length > 0) {
				affectedStoryIndexes.add(storyIndex);
			}
			storyResults.push({
				...metadata,
				storyIndex,
				status: 'success',
				changes: storyChanges,
				skippedBlocks: storySkippedBlocks,
				errors: [],
			});
		} catch (error) {
			const traversalError: StoryblokMarginMigrationError = {
				storyIndex,
				...(isTraversalError(error) ? { path: error.path } : {}),
				message: error instanceof Error ? error.message : 'Story traversal failed.',
			};
			errors.push(traversalError);
			storyResults.push({
				...metadata,
				storyIndex,
				status: 'failed',
				changes: [],
				skippedBlocks: [],
				errors: [traversalError],
			});
			proposedStories.push(story);
		}
	}

	return {
		proposedStories,
		stories: storyResults,
		changes,
		skippedBlocks,
		errors,
		summary: {
			storiesInspected: stories.length,
			affectedStories: affectedStoryIndexes.size,
			affectedBlocks,
			changesByMarginSide: {
				marginTop: changes.filter(({ field }) => field === 'marginTop').length,
				marginBottom: changes.filter(({ field }) => field === 'marginBottom').length,
			},
			unchangedBlocks: skippedBlocks.length,
			errorCount: errors.length,
		},
	};
};

export const serializeStoryblokMarginMigrationReport = (report: StoryblokMarginMigrationReport, runId: string): string => {
	const serializedReport: SerializedStoryblokMarginMigrationReport = {
		schemaVersion: 1,
		runId,
		summary: report.summary,
		stories: report.stories,
	};

	return JSON.stringify(sortKeys(serializedReport));
};
