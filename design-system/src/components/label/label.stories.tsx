import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from '../input/input';
import { Label } from './label';

const meta = {
	title: 'Components/Label',
	component: Label,
	tags: ['autodocs'],
	args: {
		children: 'Email',
		htmlFor: 'email',
	},
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInput: Story = {
	render: () => (
		<div className="grid w-80 gap-2">
			<Label htmlFor="story-email">Email</Label>
			<Input id="story-email" placeholder="you@example.com" type="email" />
		</div>
	),
};
