import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stat } from './stat';

const meta = {
	title: 'Data Display/Stat',
	component: Stat,
	tags: ['autodocs'],
	args: {
		label: 'Contributors',
		value: '1’284',
	},
	parameters: {
		docs: {
			description: {
				component: 'A labelled number, optionally with an explanation in a tooltip.',
			},
		},
	},
} satisfies Meta<typeof Stat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInfo: Story = {
	args: { info: 'The distinct count of contributors across succeeded contributions.' },
};
