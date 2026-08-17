import { RunwayMonthGrid } from '@/components/runway-month-grid/runway-month-grid';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/RunwayMonthGrid',
	component: RunwayMonthGrid,
	tags: ['autodocs'],
	argTypes: {
		numberOfMonths: {
			control: 'select',
			options: Array.from({ length: 20 }, (_, index) => index + 1),
		},
	},
} satisfies Meta<typeof RunwayMonthGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		numberOfMonths: 16,
	},
};
