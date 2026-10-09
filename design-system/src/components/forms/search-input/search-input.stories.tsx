import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SearchInput } from './search-input';

const meta = {
	title: 'Forms/SearchInput',
	component: SearchInput,
	tags: ['autodocs'],
	args: {
		placeholder: 'Search programs',
		'aria-label': 'Search programs',
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SearchInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
