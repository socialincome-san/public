import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Calendar } from './calendar';

const meta = {
	title: 'Components/Calendar',
	component: Calendar,
	tags: ['autodocs'],
	args: {
		mode: 'single',
		defaultMonth: new Date(2026, 0, 1),
	},
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
