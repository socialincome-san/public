import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { InfoTooltip } from './info-tooltip';

const meta = {
	title: 'Overlays/InfoTooltip',
	component: InfoTooltip,
	tags: ['autodocs'],
	args: {
		label: 'Show available credits explanation',
		children: 'Available credits are succeeded contributions minus paid and confirmed payouts.',
	},
	parameters: {
		docs: {
			description: {
				component: 'A help icon that explains the value or label next to it. `label` is read out by screen readers.',
			},
		},
	},
	argTypes: {
		size: { control: 'select', options: ['xs', 'sm', 'md'] },
	},
} satisfies Meta<typeof InfoTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
	args: { size: 'xs' },
};
