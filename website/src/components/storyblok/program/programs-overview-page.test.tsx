import { PageBlocks } from '@/components/content-types/page';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProgramsOverviewPage } from './programs-overview-page';
import { ProgramsOverviewSection } from './programs-overview-section';

jest.mock('@/components/content-types/page', () => ({ PageBlocks: jest.fn(() => null) }));

jest.mock('./programs-overview-section', () => ({ ProgramsOverviewSection: jest.fn(() => null) }));

jest.mock('@/components/breadcrumb/breadcrumb', () => ({ Breadcrumb: () => null }));

jest.mock('@/components/breadcrumb/build-breadcrumb-links', () => ({
	buildBreadcrumbLinks: jest.fn(() => Promise.resolve([])),
}));

const renderPage = async (content: Partial<ProgramOverview>) => {
	const overview = {
		name: 'Programs',
		uuid: 'overview-uuid',
		full_slug: 'programs',
		content: { component: 'programOverview', _uid: 'overview', ...content },
	} as ISbStoryData<ProgramOverview>;
	const searchParams = Promise.resolve({});

	return renderToStaticMarkup(await ProgramsOverviewPage({ overview, lang: 'en', currency: 'USD', searchParams }));
};

beforeEach(() => {
	jest.clearAllMocks();
});

test('renders the blocks of the story when it has some', async () => {
	await renderPage({ content: [{ component: 'programGrid', _uid: 'grid' }] });

	expect(PageBlocks).toHaveBeenCalled();
	expect(ProgramsOverviewSection).not.toHaveBeenCalled();
});

test.each([[undefined], [[]]])('falls back to the legacy fields when the blocks are %j', async (blocks) => {
	const markup = await renderPage({ content: blocks, title: 'Legacy title', showFilters: false });

	expect(PageBlocks).not.toHaveBeenCalled();
	expect(markup).toContain('Legacy title');
	expect(jest.mocked(ProgramsOverviewSection).mock.calls[0]?.[0].showFilters).toBe(false);
});
