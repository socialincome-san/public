import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Pencil } from 'lucide-react';
import { Button } from '../../actions/button/button';
import { FloatingActionBar } from './floating-action-bar';

const meta = {
	title: 'Overlays/FloatingActionBar',
	component: FloatingActionBar,
	tags: ['autodocs'],
	args: {
		label: 'Quick donation',
		visible: true,
		title: 'CHF 32',
		subtitle: 'monthly',
		icon: <Pencil />,
		summaryLabel: 'Donate CHF 32 monthly, change amount',
		onSummaryClick: () => undefined,
		action: <Button size="md">Continue</Button>,
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'A compact pill fixed to the bottom left of the viewport, so it covers little content: a summary that can be clicked, and one action. Slides in when `visible` turns true.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="h-48">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof FloatingActionBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSubtitle: Story = {
	args: {
		subtitle: undefined,
		summaryLabel: 'Donate CHF 50 once, change amount',
		title: 'CHF 50',
	},
};

export const Hidden: Story = {
	args: {
		visible: false,
	},
};
