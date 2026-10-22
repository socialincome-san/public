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
		subtitle: 'Monthly',
		icon: <Pencil />,
		summaryAction: { label: 'Donate CHF 32 monthly, change amount', onClick: () => undefined },
		action: <Button size="md">Pay</Button>,
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'A compact pill fixed to the bottom left of the viewport, so it covers little content: a summary and one action. The summary is a button only when it does something other than the action. Slides in when `visible` turns true.',
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

export const StaticSummary: Story = {
	args: {
		icon: undefined,
		summaryAction: undefined,
		action: <Button size="md">Continue</Button>,
	},
};

export const WithoutSubtitle: Story = {
	args: {
		subtitle: undefined,
		summaryAction: { label: 'Donate CHF 50 once, change amount', onClick: () => undefined },
		title: 'CHF 50',
	},
};

export const StackedAboveAnotherOverlay: Story = {
	args: {
		bottomOffset: 96,
	},
};

export const Hidden: Story = {
	args: {
		visible: false,
	},
};
