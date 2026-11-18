import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Badge } from '../badge/badge';
import { ItemCard } from './item-card';

const meta = {
	title: 'Data Display/ItemCard',
	component: ItemCard,
	tags: ['autodocs'],
	args: {
		title: 'Running 100 km for Sierra Leone',
		badges: <Badge variant="verified">Listed</Badge>,
		stats: [
			{ label: 'Raised', value: 'CHF 1,240' },
			{ label: 'Goal', value: 'CHF 5,000' },
			{ label: 'Contributions', value: '18' },
			{ label: 'Days left', value: '42' },
		],
		actions: (
			<>
				<Button variant="outline" size="sm">
					View
				</Button>
				<Button size="sm">Edit</Button>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				component:
					'One item in a list the person manages, such as their campaigns: title, status badges, key figures and actions.',
			},
		},
	},
} satisfies Meta<typeof ItemCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutActions: Story = {
	args: { actions: undefined },
};

export const WithoutStats: Story = {
	args: { stats: [], badges: <Badge variant="secondary">Awaiting approval</Badge> },
};
