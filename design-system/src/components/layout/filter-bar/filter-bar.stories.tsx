import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FilterTrigger } from '../../actions/filter-trigger/filter-trigger';
import { SearchInput } from '../../forms/search-input/search-input';
import { FilterBar } from './filter-bar';

const meta = {
	title: 'Layout/FilterBar',
	component: FilterBar,
	tags: ['autodocs'],
	parameters: { layout: 'padded' },
	args: {
		filters: (
			<>
				<div className="w-44">
					<FilterTrigger>All countries</FilterTrigger>
				</div>
				<div className="w-44">
					<FilterTrigger active>Health</FilterTrigger>
				</div>
			</>
		),
		search: <SearchInput aria-label="Search programs" placeholder="Search programs" />,
	},
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Resize the canvas: the count sits left of the search, and moves into its placeholder once the search drops below */
export const WithSummary: Story = {
	args: {
		summary: '18 programs',
		search: <SearchInput aria-label="Search programs" placeholder="Search" compactPlaceholder="Search 18 programs" />,
	},
};

/** Short lists can leave out the search; the count then always shows */
export const WithoutSearch: Story = {
	args: { summary: '5 programs', search: undefined },
};
