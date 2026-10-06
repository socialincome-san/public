import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Separator } from './separator';

const meta = {
	title: 'Data Display/Separator',
	component: Separator,
	tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
	render: () => (
		<div className="w-80">
			<Separator />
		</div>
	),
};

export const Vertical: Story = {
	render: () => (
		<div className="flex h-8 items-center gap-3">
			<span>Left</span>
			<Separator orientation="vertical" />
			<span>Right</span>
		</div>
	),
};
