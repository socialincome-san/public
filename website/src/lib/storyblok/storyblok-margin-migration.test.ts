import {
	runStoryblokMarginMigrationDryRun,
	serializeStoryblokMarginMigrationReport,
	STORYBLOK_MARGIN_COMPONENTS,
} from './storyblok-margin-migration';

describe('runStoryblokMarginMigrationDryRun', () => {
	it('maps both legacy flags and preserves the input', () => {
		const story = {
			id: 1,
			slug: 'home',
			language: 'en',
			version: 'draft',
			content: {
				body: [
					{
						component: 'text',
						disableMarginTop: true,
						disableMarginBottom: true,
						marginTop: '',
						marginBottom: null,
					},
				],
			},
		};
		const input = structuredClone(story);

		const report = runStoryblokMarginMigrationDryRun([story]);

		expect(story).toEqual(input);
		expect(report.proposedStories[0]).toEqual({
			...story,
			content: {
				body: [
					{
						...story.content.body[0],
						marginTop: 'none',
						marginBottom: 'none',
					},
				],
			},
		});
		expect(report.changes).toEqual([
			expect.objectContaining({
				storyIdentifier: 1,
				slug: 'home',
				language: 'en',
				version: 'draft',
				component: 'text',
				path: '$[0].content.body[0]',
				field: 'marginTop',
				previousValue: '',
				newValue: 'none',
			}),
			expect.objectContaining({ field: 'marginBottom', previousValue: null, newValue: 'none' }),
		]);
		expect(report.summary).toMatchObject({
			affectedStories: 1,
			affectedBlocks: 1,
			changesByMarginSide: { marginTop: 1, marginBottom: 1 },
		});
		expect(report.stories[0]).toMatchObject({
			storyIndex: 0,
			status: 'success',
			language: 'en',
			version: 'draft',
		});
	});

	it('preserves explicit values and reports skipped blocks', () => {
		const report = runStoryblokMarginMigrationDryRun([
			{
				id: 'published-story',
				content: {
					body: [
						{
							component: 'programGrid',
							disableMarginTop: true,
							disableMarginBottom: true,
							marginTop: 'sm',
							marginBottom: 'none',
						},
						{ component: 'text', disableMarginTop: false, disableMarginBottom: true, marginBottom: 'xl' },
						{ component: 'imageText' },
					],
				},
			},
		]);

		expect(report.changes).toEqual([]);
		expect(report.summary).toMatchObject({
			affectedStories: 0,
			affectedBlocks: 0,
			unchangedBlocks: 3,
			changesByMarginSide: { marginTop: 0, marginBottom: 0 },
		});
	});

	it('traverses deeply nested two-column blocks and multiple story metadata variants', () => {
		const report = runStoryblokMarginMigrationDryRun([
			{
				uuid: 'draft-uuid',
				slug: 'draft',
				language: 'de',
				version: 'draft',
				content: {
					body: [
						{
							component: 'twoColumn',
							leftColumn: [{ component: 'text', disableMarginTop: true }],
							rightColumn: [
								{
									component: 'twoColumn',
									leftColumn: [{ component: 'faqSelection', disableMarginBottom: true }],
									rightColumn: [],
								},
							],
						},
					],
				},
			},
			{ id: 3, slug: 'published', language: 'fr', version: 'published', content: { body: [] } },
		]);

		expect(report.summary).toMatchObject({
			storiesInspected: 2,
			affectedStories: 1,
			affectedBlocks: 2,
			changesByMarginSide: { marginTop: 1, marginBottom: 1 },
		});
		expect(report.changes.map(({ path }) => path)).toEqual([
			'$[0].content.body[0].leftColumn[0]',
			'$[0].content.body[0].rightColumn[0].leftColumn[0]',
		]);
	});

	it('counts same story paths independently across language and version metadata', () => {
		const report = runStoryblokMarginMigrationDryRun([
			{ id: 7, language: 'en', version: 'draft', content: { body: [{ component: 'text', disableMarginTop: true }] } },
			{
				id: 7,
				language: 'de',
				version: 'published',
				content: { body: [{ component: 'text', disableMarginBottom: true }] },
			},
		]);

		expect(report.summary).toMatchObject({
			storiesInspected: 2,
			affectedStories: 2,
			affectedBlocks: 2,
			changesByMarginSide: { marginTop: 1, marginBottom: 1 },
		});
	});

	it('recognizes every allowed component and ignores near-miss names', () => {
		const report = runStoryblokMarginMigrationDryRun([
			{
				content: {
					body: [
						...STORYBLOK_MARGIN_COMPONENTS.map((component) => ({ component, disableMarginTop: true })),
						{ component: 'faqSection', disableMarginTop: true },
					],
				},
			},
		]);

		expect(report.changes).toHaveLength(STORYBLOK_MARGIN_COMPONENTS.length);
		expect(report.changes.every(({ component }) => STORYBLOK_MARGIN_COMPONENTS.includes(component))).toBe(true);
		expect(report.summary.affectedBlocks).toBe(STORYBLOK_MARGIN_COMPONENTS.length);
		expect(report.skippedBlocks).toEqual([]);
	});

	it('is idempotent after applying the proposed copies', () => {
		const first = runStoryblokMarginMigrationDryRun([
			{ id: 1, content: { body: [{ component: 'text', disableMarginTop: true }] } },
		]);
		const second = runStoryblokMarginMigrationDryRun(first.proposedStories);

		expect(second.changes).toEqual([]);
		expect(second.summary.affectedStories).toBe(0);
	});

	it('reports malformed input and circular stories safely', () => {
		const circular: Record<string, unknown> = {
			content: { body: [{ component: 'text', disableMarginTop: true }] },
		};
		circular.self = circular;

		const invalid = runStoryblokMarginMigrationDryRun([null, circular]);

		expect(invalid.proposedStories).toEqual([null, circular]);
		expect(invalid.errors).toEqual([
			{ storyIndex: 0, message: 'Story payload must be an object.' },
			{ storyIndex: 1, path: '$[1].self', message: 'Circular value encountered at $[1].self' },
		]);
		expect(invalid.changes).toEqual([]);
		expect(invalid.skippedBlocks).toEqual([]);
		expect(invalid.summary).toMatchObject({
			storiesInspected: 2,
			errorCount: 2,
			affectedStories: 0,
			affectedBlocks: 0,
			changesByMarginSide: { marginTop: 0, marginBottom: 0 },
		});
		expect(invalid.stories).toEqual([
			{
				storyIndex: 0,
				status: 'failed',
				changes: [],
				skippedBlocks: [],
				errors: [{ storyIndex: 0, message: 'Story payload must be an object.' }],
			},
			{
				storyIndex: 1,
				status: 'failed',
				changes: [],
				skippedBlocks: [],
				errors: [{ storyIndex: 1, path: '$[1].self', message: 'Circular value encountered at $[1].self' }],
			},
		]);
		expect(runStoryblokMarginMigrationDryRun({})).toMatchObject({
			proposedStories: [],
			stories: [],
			errors: [{ message: 'Input must be an array of Storyblok story payloads.' }],
		});
	});

	it('serializes a versioned deterministic report that round-trips as JSON', () => {
		const report = runStoryblokMarginMigrationDryRun([
			{
				id: 4,
				slug: 'home',
				language: 'en',
				version: 'published',
				content: { body: [{ component: 'text', disableMarginTop: true }] },
			},
		]);

		const serialized = serializeStoryblokMarginMigrationReport(report, 'fixture-run');
		const parsed = JSON.parse(serialized) as {
			schemaVersion: number;
			runId: string;
			summary: typeof report.summary;
			stories: typeof report.stories;
		};

		expect(parsed.schemaVersion).toBe(1);
		expect(parsed.runId).toBe('fixture-run');
		expect(parsed.summary).toEqual(report.summary);
		expect(parsed.stories).toEqual(report.stories);
		expect(JSON.parse(JSON.stringify(parsed))).toEqual(parsed);
	});

	it('keeps serialized story results consistent with aggregate summary counts', () => {
		const report = runStoryblokMarginMigrationDryRun([
			{
				id: 8,
				language: 'en',
				version: 'draft',
				content: {
					body: [
						{
							component: 'text',
							disableMarginTop: true,
							disableMarginBottom: true,
						},
					],
				},
			},
			{
				id: 8,
				language: 'de',
				version: 'published',
				content: {
					body: [{ component: 'programGrid', marginTop: 'sm', disableMarginTop: true }],
				},
			},
			null,
		]);

		const serialized = JSON.parse(serializeStoryblokMarginMigrationReport(report, 'summary-run')) as {
			summary: typeof report.summary;
			stories: typeof report.stories;
		};
		const successfulStories = serialized.stories.filter(({ status }) => status === 'success');
		const failedStories = serialized.stories.filter(({ status }) => status === 'failed');

		expect(serialized.summary).toEqual({
			storiesInspected: serialized.stories.length,
			affectedStories: successfulStories.filter(({ changes }) => changes.length > 0).length,
			affectedBlocks: successfulStories.reduce(
				(total, { changes }) => total + new Set(changes.map(({ path }) => path)).size,
				0,
			),
			changesByMarginSide: {
				marginTop: successfulStories.reduce(
					(total, { changes }) => total + changes.filter(({ field }) => field === 'marginTop').length,
					0,
				),
				marginBottom: successfulStories.reduce(
					(total, { changes }) => total + changes.filter(({ field }) => field === 'marginBottom').length,
					0,
				),
			},
			unchangedBlocks: successfulStories.reduce((total, { skippedBlocks }) => total + skippedBlocks.length, 0),
			errorCount: failedStories.reduce((total, { errors }) => total + errors.length, 0),
		});
	});

	it('produces identical serialized output for identical reports and run IDs', () => {
		const stories = [{ id: 5, content: { body: [{ component: 'text', disableMarginBottom: true }] } }];
		const first = serializeStoryblokMarginMigrationReport(runStoryblokMarginMigrationDryRun(stories), 'stable-run');
		const second = serializeStoryblokMarginMigrationReport(
			runStoryblokMarginMigrationDryRun(structuredClone(stories)),
			'stable-run',
		);

		expect(second).toBe(first);
	});
});
