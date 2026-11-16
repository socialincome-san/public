import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { resultFail, resultOk } from '@/lib/result';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import { getPageMetadata } from '../page-metadata';
import { generateMetadata } from './page';

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({ getStoryWithFallback: jest.fn() }));

jest.mock('../page-metadata', () => ({ getPageMetadata: jest.fn() }));

jest.mock('@/components/storyblok/program/programs-overview-page', () => ({ ProgramsOverviewPage: () => null }));

const mockStory = (content: Partial<ProgramOverview>) =>
	jest.mocked(getStoryWithFallback).mockResolvedValue(
		resultOk({
			name: 'Programs story',
			content: { component: 'programOverview', _uid: 'overview', ...content },
		} as ISbStoryData<ProgramOverview>),
	);

const run = () => generateMetadata({ params: Promise.resolve({ lang: 'en', currency: 'usd' }) });

beforeEach(() => {
	jest.clearAllMocks();
});

test('uses the default metadata when the story cannot be loaded', async () => {
	jest.mocked(getStoryWithFallback).mockResolvedValue(resultFail('Not found.'));
	await run();

	expect(getPageMetadata).toHaveBeenCalledWith('en', 'programs', {});
});

test('takes title and text from the legacy fields when the story has no blocks', async () => {
	mockStory({ title: 'Legacy title', text: 'Legacy text' });
	await run();

	expect(getPageMetadata).toHaveBeenCalledWith('en', 'programs', { title: 'Legacy title', description: 'Legacy text' });
});

test('takes the title from the first heading of the blocks', async () => {
	mockStory({
		content: [{ component: 'pageIntro', _uid: 'intro', title: 'Our **programs**', description: 'What we do' }],
	});
	await run();

	expect(getPageMetadata).toHaveBeenCalledWith('en', 'programs', { title: 'Our programs', description: 'What we do' });
});

test('falls back to the story name when the blocks have no heading', async () => {
	mockStory({ content: [{ component: 'programGrid', _uid: 'grid' }] });
	await run();

	expect(getPageMetadata).toHaveBeenCalledWith('en', 'programs', { title: 'Programs story' });
});
