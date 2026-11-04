import { mkdir, mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { runStoryblokMarginMigrationDryRun, type StoryblokMarginMigrationReport } from './storyblok-margin-migration';
import {
	exportAndRunStoryblokMarginMigration,
	fetchStoryblokReadOnly,
	hashStory,
	resolveSafeOutputDirectory,
	selectSuccessfulProposals,
	type StoryblokReadOnlyClient,
	type StoryblokStorySnapshot,
	type StoryblokStorySummary,
	writeStoryblokMarginMigrationOutput,
} from './storyblok-margin-migration-export';

const createClient = (
	pages: { stories: StoryblokStorySummary[]; total: number }[],
	options?: {
		languages?: string[];
		draftPayloads?: Record<number, Record<string, unknown>>;
		publishedPayloads?: Record<number, Record<string, unknown>>;
	},
): StoryblokReadOnlyClient => ({
	getEnabledLanguages: () => Promise.resolve(options?.languages ?? ['en', 'de']),
	listStories: (page) => Promise.resolve(pages[page - 1] ?? { stories: [], total: pages[0]?.total ?? 0 }),
	getStoryDraft: (summary) =>
		Promise.resolve({
			story: options?.draftPayloads?.[summary.id] ?? {
				id: summary.id,
				uuid: summary.uuid,
				slug: summary.slug,
				content: {
					body: [{ component: 'text', disableMarginTop: true, disableMarginBottom: true }],
				},
			},
			metadata: {
				storyId: summary.id,
				uuid: summary.uuid,
				slug: summary.slug,
				isPublished: summary.isPublished,
				hasUnpublishedChanges: summary.hasUnpublishedChanges,
			},
		}),
	getPublishedStory: (summary) => {
		if (!summary.isPublished) {
			return Promise.resolve(null);
		}
		const publishedContent = options?.publishedPayloads?.[summary.id];
		if (!publishedContent) {
			return Promise.resolve(null);
		}

		return Promise.resolve({
			story: publishedContent,
			metadata: {
				storyId: summary.id,
				uuid: summary.uuid,
				slug: summary.slug,
			},
		});
	},
});

describe('exportAndRunStoryblokMarginMigration', () => {
	it('exports published stories with no draft changes and generates auto-publish proposals', async () => {
		const result = await exportAndRunStoryblokMarginMigration({
			client: createClient([
				{
					stories: [
						{
							id: 1,
							uuid: 'uuid-1',
							slug: 'home',
							isPublished: true,
							hasUnpublishedChanges: false,
						},
						{
							id: 2,
							uuid: 'uuid-2',
							slug: 'about',
							isPublished: true,
							hasUnpublishedChanges: false,
						},
					],
					total: 2,
				},
			]),
			runId: 'published-in-sync-run',
			retrievedAt: '2026-01-01T00:00:00.000Z',
		});

		expect(result.manifest).toMatchObject({
			runId: 'published-in-sync-run',
			spaceLanguages: ['en', 'de'],
			completion: 'complete',
			storyCount: 2,
			snapshotCount: 2,
			counts: {
				draftOnly: 0,
				published: 2,
				publishedWithUnpublishedChanges: 0,
			},
			coverage: {
				complete: true,
			},
		});
		expect(result.snapshots).toHaveLength(2);
		expect(result.snapshots[0].publicationStatus).toBe('published');
		expect(result.snapshots[0].publishedContentMatchesDraft).toBe(true);
		expect(result.snapshots[0].draftContentHash).toBe(result.snapshots[0].publishedContentHash);
		expect(result.proposedStories).toHaveLength(2);
		expect(result.proposedStories[0].publish).toBe(true);
		expect(result.proposedStories[0].hasUnpublishedChanges).toBe(false);
	});

	it('exports published stories with unpublished changes, computes separate hashes, and flags publish=false', async () => {
		const result = await exportAndRunStoryblokMarginMigration({
			client: createClient(
				[
					{
						stories: [
							{
								id: 10,
								uuid: 'uuid-10',
								slug: 'campaign',
								isPublished: true,
								hasUnpublishedChanges: true,
							},
						],
						total: 1,
					},
				],
				{
					draftPayloads: {
						10: {
							id: 10,
							uuid: 'uuid-10',
							slug: 'campaign',
							content: {
								headline: 'Draft Headline Not Yet Published',
								body: [{ component: 'text', disableMarginTop: true }],
							},
						},
					},
					publishedPayloads: {
						10: {
							id: 10,
							uuid: 'uuid-10',
							slug: 'campaign',
							content: {
								headline: 'Live Headline',
								body: [{ component: 'text', disableMarginTop: true }],
							},
						},
					},
				},
			),
			runId: 'unpublished-changes-run',
			retrievedAt: '2026-01-01T00:00:00.000Z',
		});

		expect(result.snapshots[0].publicationStatus).toBe('published-with-unpublished-changes');
		expect(result.snapshots[0].publishedContentMatchesDraft).toBe(false);
		expect(result.snapshots[0].draftContentHash).not.toBe(result.snapshots[0].publishedContentHash);
		expect(result.proposedStories[0].publish).toBe(false);
		expect(result.proposedStories[0].hasUnpublishedChanges).toBe(true);
		expect(result.manifest.counts.publishedWithUnpublishedChanges).toBe(1);
	});

	it('exports draft-only stories with publicationStatus=draft-only and publish=false', async () => {
		const result = await exportAndRunStoryblokMarginMigration({
			client: createClient([
				{
					stories: [
						{
							id: 20,
							uuid: 'uuid-20',
							slug: 'draft-page',
							isPublished: false,
							hasUnpublishedChanges: false,
						},
					],
					total: 1,
				},
			]),
			runId: 'draft-only-run',
		});

		expect(result.snapshots[0].publicationStatus).toBe('draft-only');
		expect(result.snapshots[0].publishedStory).toBeUndefined();
		expect(result.proposedStories[0].publish).toBe(false);
		expect(result.manifest.counts.draftOnly).toBe(1);
	});

	it('migrates multilingual stories with field-level translations in canonical story tree', async () => {
		const result = await exportAndRunStoryblokMarginMigration({
			client: createClient(
				[
					{
						stories: [
							{
								id: 30,
								uuid: 'uuid-30',
								slug: 'multilingual-home',
								isPublished: true,
								hasUnpublishedChanges: false,
							},
						],
						total: 1,
					},
				],
				{
					languages: ['en', 'de', 'fr'],
					draftPayloads: {
						30: {
							id: 30,
							uuid: 'uuid-30',
							slug: 'multilingual-home',
							content: {
								body: [
									{
										component: 'text',
										headline: 'Hello',
										headline__i18n__de: 'Hallo',
										headline__i18n__fr: 'Bonjour',
										disableMarginTop: true,
										disableMarginBottom: true,
									},
								],
							},
						},
					},
				},
			),
			languages: ['en', 'de', 'fr'],
			runId: 'multilingual-run',
		});

		expect(result.manifest.spaceLanguages).toEqual(['en', 'de', 'fr']);
		const transformedContent = result.proposedStories[0]?.story?.content as { body: Record<string, unknown>[] };
		expect(transformedContent.body[0].marginTop).toBe('none');
		expect(transformedContent.body[0].marginBottom).toBe('none');
		expect(transformedContent.body[0].headline__i18n__de).toBe('Hallo');
		expect(transformedContent.body[0].headline__i18n__fr).toBe('Bonjour');
	});

	it('marks coverage as unproven when a published story with unpublished changes has no published snapshot', async () => {
		const clientWithoutPublishedFetcher: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () =>
				Promise.resolve({
					stories: [
						{
							id: 40,
							uuid: 'uuid-40',
							slug: 'missing-published',
							isPublished: true,
							hasUnpublishedChanges: true,
						},
					],
					total: 1,
				}),
			getStoryDraft: (summary) =>
				Promise.resolve({
					story: { id: summary.id, content: {} },
					metadata: {
						storyId: summary.id,
						uuid: summary.uuid,
						slug: summary.slug,
						isPublished: true,
						hasUnpublishedChanges: true,
					},
				}),
			getPublishedStory: () => Promise.resolve(null),
		};

		const result = await exportAndRunStoryblokMarginMigration({
			client: clientWithoutPublishedFetcher,
			runId: 'missing-published-run',
		});

		expect(result.manifest.coverage.complete).toBe(false);
		expect(result.manifest.completion).toBe('completed-with-unproven-coverage');
		expect(result.manifest.coverage.limitations.some((limitation) => limitation.includes('could not be retrieved'))).toBe(
			true,
		);
	});

	it('fails closed when draft or published response metadata mismatches story identity', async () => {
		const mismatchedDraftClient: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () =>
				Promise.resolve({
					stories: [{ id: 50, uuid: 'uuid-50', slug: 'page', isPublished: false, hasUnpublishedChanges: false }],
					total: 1,
				}),
			getStoryDraft: () =>
				Promise.resolve({
					story: { id: 999, uuid: 'uuid-50', content: {} },
					metadata: { storyId: 999, uuid: 'uuid-50', slug: 'page' },
				}),
		};

		await expect(
			exportAndRunStoryblokMarginMigration({
				client: mismatchedDraftClient,
				runId: 'mismatch-draft',
			}),
		).rejects.toThrow('identity 999');

		const mismatchedUuidClient: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () =>
				Promise.resolve({
					stories: [{ id: 51, uuid: 'uuid-51', slug: 'page', isPublished: true, hasUnpublishedChanges: true }],
					total: 1,
				}),
			getStoryDraft: (summary) =>
				Promise.resolve({
					story: { id: summary.id, uuid: summary.uuid, content: {} },
					metadata: { storyId: summary.id, uuid: summary.uuid, slug: summary.slug },
				}),
			getPublishedStory: (summary) =>
				Promise.resolve({
					story: { id: summary.id, uuid: 'wrong-uuid', content: {} },
					metadata: { storyId: summary.id, uuid: 'wrong-uuid', slug: summary.slug },
				}),
		};

		await expect(
			exportAndRunStoryblokMarginMigration({
				client: mismatchedUuidClient,
				runId: 'mismatch-uuid',
			}),
		).rejects.toThrow('UUID wrong-uuid');
	});

	it('fails closed when a story publication state changes between enumeration and retrieval', async () => {
		const changedPublicationClient: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () =>
				Promise.resolve({
					stories: [{ id: 60, uuid: 'uuid-60', slug: 'race-page', isPublished: false, hasUnpublishedChanges: false }],
					total: 1,
				}),
			getStoryDraft: (summary) =>
				Promise.resolve({
					story: { id: summary.id, uuid: summary.uuid, content: {} },
					metadata: { storyId: summary.id, uuid: summary.uuid, slug: summary.slug, isPublished: true },
				}),
		};

		await expect(
			exportAndRunStoryblokMarginMigration({
				client: changedPublicationClient,
				runId: 'race-is-published',
			}),
		).rejects.toThrow('isPublished=true');

		const changedUnpublishedChangesClient: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () =>
				Promise.resolve({
					stories: [{ id: 61, uuid: 'uuid-61', slug: 'race-page-2', isPublished: true, hasUnpublishedChanges: false }],
					total: 1,
				}),
			getStoryDraft: (summary) =>
				Promise.resolve({
					story: { id: summary.id, uuid: summary.uuid, content: {} },
					metadata: {
						storyId: summary.id,
						uuid: summary.uuid,
						slug: summary.slug,
						isPublished: true,
						hasUnpublishedChanges: true,
					},
				}),
		};

		await expect(
			exportAndRunStoryblokMarginMigration({
				client: changedUnpublishedChangesClient,
				runId: 'race-unpublished-changes',
			}),
		).rejects.toThrow('hasUnpublishedChanges=true');
	});

	it('fails closed on CDN authentication or network failure during published verification', async () => {
		const cdnAuthFailureClient: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () =>
				Promise.resolve({
					stories: [{ id: 70, uuid: 'uuid-70', slug: 'cdn-auth-fail', isPublished: true, hasUnpublishedChanges: true }],
					total: 1,
				}),
			getStoryDraft: (summary) =>
				Promise.resolve({
					story: { id: summary.id, uuid: summary.uuid, content: {} },
					metadata: { storyId: summary.id, uuid: summary.uuid, slug: summary.slug },
				}),
			getPublishedStory: () => Promise.reject(new Error('Storyblok CDN read request failed with status 401.')),
		};

		await expect(
			exportAndRunStoryblokMarginMigration({
				client: cdnAuthFailureClient,
				runId: 'cdn-auth-fail',
			}),
		).rejects.toThrow('status 401');
	});

	it('fails closed when space configuration or pagination metadata is ambiguous or inconsistent', async () => {
		const spaceAuthFailureClient: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.reject(new Error('Management API request failed with status 401.')),
			listStories: () => Promise.resolve({ stories: [], total: 0 }),
			getStoryDraft: () => Promise.resolve({ story: {}, metadata: { storyId: 1, uuid: 'u1' } }),
		};
		await expect(
			exportAndRunStoryblokMarginMigration({
				client: spaceAuthFailureClient,
				runId: 'space-auth-fail',
			}),
		).rejects.toThrow('status 401');

		const totalChangedClient: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: (page) =>
				Promise.resolve({
					stories: [{ id: page, uuid: `u-${page}`, slug: `p-${page}`, isPublished: false, hasUnpublishedChanges: false }],
					total: page === 1 ? 2 : 3,
				}),
			getStoryDraft: (summary) => Promise.resolve({ story: {}, metadata: { storyId: summary.id, uuid: summary.uuid } }),
		};
		await expect(
			exportAndRunStoryblokMarginMigration({
				client: totalChangedClient,
				perPage: 1,
				runId: 'total-changed',
			}),
		).rejects.toThrow('total changed during pagination');

		const responsePageMismatchClient: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () =>
				Promise.resolve({
					stories: [{ id: 1, uuid: 'u-1', slug: 'p-1', isPublished: false, hasUnpublishedChanges: false }],
					total: 1,
					responsePage: 2,
				}),
			getStoryDraft: (summary) => Promise.resolve({ story: {}, metadata: { storyId: summary.id, uuid: summary.uuid } }),
		};
		await expect(
			exportAndRunStoryblokMarginMigration({
				client: responsePageMismatchClient,
				runId: 'page-mismatch',
			}),
		).rejects.toThrow('returned page 2 for requested page 1');
	});

	it.each([
		[
			'incomplete page',
			[
				{
					stories: [{ id: 1, uuid: 'u1', slug: 'home', isPublished: false, hasUnpublishedChanges: false }],
					total: 2,
				},
			],
		],
		[
			'duplicate identity',
			[
				{
					stories: [
						{ id: 1, uuid: 'u1', slug: 'home', isPublished: false, hasUnpublishedChanges: false },
						{ id: 1, uuid: 'u2', slug: 'home-again', isPublished: false, hasUnpublishedChanges: false },
					],
					total: 2,
				},
			],
		],
		[
			'duplicate uuid',
			[
				{
					stories: [
						{ id: 1, uuid: 'u1', slug: 'home', isPublished: false, hasUnpublishedChanges: false },
						{ id: 2, uuid: 'u1', slug: 'about', isPublished: false, hasUnpublishedChanges: false },
					],
					total: 2,
				},
			],
		],
	])('fails closed for %s', async (_name, pages) => {
		await expect(
			exportAndRunStoryblokMarginMigration({
				client: createClient(pages),
				runId: 'fixture-run',
			}),
		).rejects.toThrow();
	});

	it('accepts an empty, complete export', async () => {
		const result = await exportAndRunStoryblokMarginMigration({
			client: createClient([{ stories: [], total: 0 }], { languages: ['en'] }),
			runId: 'empty-run',
		});

		expect(result.snapshots).toEqual([]);
		expect(result.report.summary.storiesInspected).toBe(0);
		expect(result.manifest.completion).toBe('complete');
	});

	it('hashes equivalent payloads deterministically regardless of key order', () => {
		expect(hashStory({ b: 2, a: { d: 4, c: 3 } })).toBe(hashStory({ a: { c: 3, d: 4 }, b: 2 }));
	});

	it('excludes failed story transformations from successful proposals', () => {
		const snapshots: StoryblokStorySnapshot[] = [
			{
				storyId: 1,
				uuid: 'u1',
				slug: 'fail',
				isPublished: false,
				hasUnpublishedChanges: false,
				publicationStatus: 'draft-only',
				retrievedAt: '2026-01-01T00:00:00.000Z',
				draftContentHash: 'hash',
				draftStory: { self: null },
			},
		];
		const report = runStoryblokMarginMigrationDryRun([snapshots[0].draftStory]);
		const failedReport = {
			...report,
			stories: [
				{
					storyIndex: 0,
					status: 'failed' as const,
					errors: [{ storyIndex: 0, message: 'failed' }],
					changes: [],
					skippedBlocks: [],
				},
			],
			proposedStories: [snapshots[0].draftStory],
		};

		expect(selectSuccessfulProposals(failedReport, snapshots)).toEqual([]);
	});

	it('strictly ensures draft-only stories cannot receive a publish instruction', () => {
		const snapshots: StoryblokStorySnapshot[] = [
			{
				storyId: 101,
				uuid: 'u101',
				slug: 'draft-only-test',
				isPublished: false,
				hasUnpublishedChanges: false,
				publicationStatus: 'draft-only',
				retrievedAt: '2026-01-01T00:00:00.000Z',
				draftContentHash: 'hash-1',
				draftStory: { content: { body: [] } },
			},
			{
				storyId: 102,
				uuid: 'u102',
				slug: 'draft-with-changes-test',
				isPublished: false,
				hasUnpublishedChanges: true,
				publicationStatus: 'draft-only',
				retrievedAt: '2026-01-01T00:00:00.000Z',
				draftContentHash: 'hash-2',
				draftStory: { content: { body: [] } },
			},
		];

		const report: StoryblokMarginMigrationReport = {
			proposedStories: [snapshots[0].draftStory, snapshots[1].draftStory],
			stories: [
				{ storyIndex: 0, status: 'success', changes: [], skippedBlocks: [], errors: [] },
				{ storyIndex: 1, status: 'success', changes: [], skippedBlocks: [], errors: [] },
			],
			changes: [],
			skippedBlocks: [],
			errors: [],
			summary: {
				storiesInspected: 2,
				affectedStories: 0,
				affectedBlocks: 0,
				changesByMarginSide: { marginTop: 0, marginBottom: 0 },
				unchangedBlocks: 0,
				errorCount: 0,
			},
		};

		const proposals = selectSuccessfulProposals(report, snapshots);
		expect(proposals).toHaveLength(2);
		expect(proposals[0].publish).toBe(false);
		expect(proposals[1].publish).toBe(false);
	});

	it('produces deterministic manifests and reports for the same export', async () => {
		const options = {
			client: createClient(
				[
					{
						stories: [{ id: 1, uuid: 'u1', slug: 'home', isPublished: true, hasUnpublishedChanges: false }],
						total: 1,
					},
				],
				{ languages: ['en'] },
			),
			runId: 'deterministic-run',
			retrievedAt: '2026-01-01T00:00:00.000Z',
		};
		const first = await exportAndRunStoryblokMarginMigration(options);
		const second = await exportAndRunStoryblokMarginMigration(options);

		expect(JSON.stringify(first.manifest)).toBe(JSON.stringify(second.manifest));
		expect(JSON.stringify(first.report)).toBe(JSON.stringify(second.report));
	});

	it('propagates list and story request failures without creating a report', async () => {
		const listFailure: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () => Promise.reject(new Error('list request failed')),
			getStoryDraft: () => Promise.resolve({ story: {}, metadata: { storyId: 1, uuid: 'u1' } }),
		};
		await expect(exportAndRunStoryblokMarginMigration({ client: listFailure, runId: 'failed-list' })).rejects.toThrow(
			'list request failed',
		);

		const draftFailure: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () =>
				Promise.resolve({
					stories: [{ id: 1, uuid: 'u1', slug: 'home', isPublished: false, hasUnpublishedChanges: false }],
					total: 1,
				}),
			getStoryDraft: () => Promise.reject(new Error('draft request failed')),
		};
		await expect(exportAndRunStoryblokMarginMigration({ client: draftFailure, runId: 'failed-draft' })).rejects.toThrow(
			'draft request failed',
		);
	});

	it('rejects invalid story payloads and invalid pagination totals', async () => {
		const invalidStory: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () =>
				Promise.resolve({
					stories: [{ id: 1, uuid: 'u1', slug: 'home', isPublished: false, hasUnpublishedChanges: false }],
					total: 1,
				}),
			getStoryDraft: () =>
				Promise.resolve(null as unknown as { story: Record<string, unknown>; metadata: { storyId: number; uuid: string } }),
		};
		await expect(exportAndRunStoryblokMarginMigration({ client: invalidStory, runId: 'invalid-story' })).rejects.toThrow(
			'invalid draft story response',
		);

		const invalidTotal: StoryblokReadOnlyClient = {
			getEnabledLanguages: () => Promise.resolve(['en']),
			listStories: () => Promise.resolve({ stories: [], total: -1 }),
			getStoryDraft: () => Promise.resolve({ story: {}, metadata: { storyId: 1, uuid: 'u1' } }),
		};
		await expect(exportAndRunStoryblokMarginMigration({ client: invalidTotal, runId: 'invalid-total' })).rejects.toThrow(
			'invalid total',
		);
	});

	it('retries transient responses and fails after the bounded retry count', async () => {
		let attempts = 0;
		const fetchImplementation = () => {
			attempts += 1;

			return Promise.resolve(new Response('{}', { status: attempts < 3 ? 503 : 200 }));
		};
		await expect(fetchStoryblokReadOnly('https://example.test', {}, fetchImplementation)).resolves.toHaveProperty(
			'status',
			200,
		);
		expect(attempts).toBe(3);

		attempts = 0;
		await expect(
			fetchStoryblokReadOnly('https://example.test', {}, () => {
				attempts += 1;

				return Promise.resolve(new Response('{}', { status: 503 }));
			}),
		).resolves.toHaveProperty('status', 503);
		expect(attempts).toBe(3);
	});

	it('rejects repository-local and existing output directories', async () => {
		expect(() => resolveSafeOutputDirectory(join(process.cwd(), 'migration-output'), process.cwd())).toThrow('outside');

		const parent = await mkdtemp(join(tmpdir(), 'storyblok-output-parent-'));
		const existing = join(parent, 'existing');
		await mkdir(existing);
		expect(() => resolveSafeOutputDirectory(existing, process.cwd())).toThrow('already exists');
		await rm(existing, { recursive: true, force: true });
		await rm(parent, { recursive: true, force: true });
	});

	it('does not leave an output directory when serialization fails', async () => {
		const result = await exportAndRunStoryblokMarginMigration({
			client: createClient([
				{
					stories: [{ id: 1, uuid: 'u1', slug: 'home', isPublished: false, hasUnpublishedChanges: false }],
					total: 1,
				},
			]),
			runId: 'atomic-failure',
			retrievedAt: '2026-01-01T00:00:00.000Z',
		});
		const parent = await mkdtemp(join(tmpdir(), 'storyblok-output-parent-'));
		const output = join(parent, 'output');
		const circular: Record<string, unknown> = {};
		circular.self = circular;
		result.snapshots[0].draftStory = circular;

		await expect(writeStoryblokMarginMigrationOutput(result, output)).rejects.toThrow();
		await expect(rm(output)).rejects.toThrow();
		await rm(parent, { recursive: true, force: true });
	});
});
