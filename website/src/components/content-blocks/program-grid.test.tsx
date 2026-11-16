import { getProgramGridPrograms, ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { ProgramsOverviewSection } from '@/components/storyblok/program/programs-overview-section';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProgramGridBlock } from './program-grid';

jest.mock('@/components/content-blocks/program-grid-view', () => ({
	getProgramGridPrograms: jest.fn(),
	ProgramGridView: jest.fn(() => null),
}));

jest.mock('@/components/storyblok/program/programs-overview-section', () => ({
	ProgramsOverviewSection: jest.fn(() => null),
}));

jest.mock('@storyblok/react', () => ({
	storyblokEditable: jest.fn(() => ({})),
}));

// Its Markdown parser is ESM only, which Jest does not load
jest.mock('@/components/storyblok-markdown', () => ({
	StoryblokMarkdown: ({ children }: { children: string }) => children,
}));

const renderBlock = async (fields: Partial<ProgramGrid>) => {
	const searchParams = Promise.resolve({ country: 'SL' });
	const blok: ProgramGrid = { component: 'programGrid', _uid: 'grid', ...fields };
	renderToStaticMarkup(await ProgramGridBlock({ blok, lang: 'en', currency: 'USD', searchParams }));

	return { searchParams };
};

beforeEach(() => {
	jest.clearAllMocks();
	jest.mocked(getProgramGridPrograms).mockResolvedValue({ programs: [], statsByPortalSlug: {}, allProgramsCount: 0 });
});

test('shows all programs with the filter bar of the programs page, which keeps its filters in the URL', async () => {
	const { searchParams } = await renderBlock({ showFilters: true, showAllPrograms: false, maxPrograms: '3' });

	const props = jest.mocked(ProgramsOverviewSection).mock.calls[0]?.[0];
	expect(props?.searchParams).toBe(searchParams);
	expect(props?.showFilters).toBe(true);
	expect(getProgramGridPrograms).not.toHaveBeenCalled();
	expect(ProgramGridView).not.toHaveBeenCalled();
});

test('shows its own selection of programs without the filter bar', async () => {
	await renderBlock({ showAllPrograms: false, maxPrograms: '3' });

	expect(ProgramGridView).toHaveBeenCalled();
	expect(ProgramsOverviewSection).not.toHaveBeenCalled();
});
