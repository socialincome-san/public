import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from '../../data-display/card/card';
import { CardGrid, CardGridItem } from './card-grid';

const programs = ['Sierra Leone Pilot', 'Freetown Youth', 'Makeni Women', 'Bo Farmers'];

const meta = {
	title: 'Layout/CardGrid',
	component: CardGrid,
	tags: ['autodocs'],
	args: {
		emptyMessage: 'No programs yet.',
		children: programs.map((program) => (
			<CardGridItem key={program}>
				<Card>
					<p className="text-foreground p-6 font-medium">{program}</p>
				</Card>
			</CardGridItem>
		)),
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'The grid of an overview page, such as all programs or campaigns. Shows a message when it is empty.',
			},
		},
	},
} satisfies Meta<typeof CardGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
	args: { children: [] },
};
