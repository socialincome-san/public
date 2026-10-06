import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SectionHeading } from './section-heading';

const meta = {
	title: 'Layout/SectionHeading',
	component: SectionHeading,
	tags: ['autodocs'],
	args: {
		children: 'Where the money goes',
	},
} satisfies Meta<typeof SectionHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<SectionHeading size={2}>Section</SectionHeading>
			<SectionHeading size={4} align="left">
				Left aligned
			</SectionHeading>
			<SectionHeading size={6} bold>
				Bold small heading
			</SectionHeading>
		</div>
	),
};
