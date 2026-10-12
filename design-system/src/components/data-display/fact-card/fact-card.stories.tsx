import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from '../badge/badge';
import { FactCard } from './fact-card';

const meta = {
	title: 'Data Display/Fact Card',
	component: FactCard,
	tags: ['autodocs'],
	args: {
		label: 'Role',
		value: 'Program Lead',
	},
	parameters: {
		docs: {
			description: {
				component:
					'A card with one labelled fact. With details it becomes a button that opens a dialog listing the fact and the details.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-72">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof FactCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDetails: Story = {
	args: {
		label: 'Time commitment',
		value: '4-8 hrs / week',
		details: {
			title: 'Volunteer commitment',
			facts: [
				{ label: 'Work style', value: 'Async' },
				{ label: 'Deadlines', value: 'Likes deadlines' },
			],
		},
	},
};

export const WithChildren: Story = {
	args: {
		label: 'Circles',
		value: undefined,
		children: (
			<div className="flex flex-wrap gap-2">
				<Badge variant="primary" size="lg">
					Tech Circle
				</Badge>
				<Badge variant="primary-outline" size="lg">
					Partnership Circle
				</Badge>
			</div>
		),
	},
};
