import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from '../badge/badge';
import { Marquee } from './marquee';

const meta = {
	title: 'Data Display/Marquee',
	component: Marquee,
	tags: ['autodocs'],
	parameters: { layout: 'padded' },
	args: {
		children: (
			<div className="flex gap-4 pr-4">
				{['Partner A', 'Partner B', 'Partner C', 'Partner D', 'Partner E', 'Partner F'].map((name) => (
					<Badge key={name} size="lg">
						{name}
					</Badge>
				))}
			</div>
		),
	},
} satisfies Meta<typeof Marquee>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Left: Story = {};

export const RightFast: Story = {
	args: { direction: 'right', speed: 'fast' },
};
