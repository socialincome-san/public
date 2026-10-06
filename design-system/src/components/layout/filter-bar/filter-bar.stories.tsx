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
