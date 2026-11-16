import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RowLink } from './row-link';

const meta = {
	title: 'Actions/RowLink',
	component: RowLink,
	tags: ['autodocs'],
	args: {
		label: '+ 4 more programs',
		href: '#',
	},
	parameters: {
		docs: {
			description: {
				component: 'A quiet, outlined link in the shape of a list row, such as the link to the rest of a list.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="h-14 w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof RowLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
