import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TickerPill } from './ticker-pill';

const portrait = '/assets/storybook/placeholder-portrait.svg';

const meta = {
	title: 'Actions/TickerPill',
	component: TickerPill,
	tags: ['autodocs'],
	args: {
		items: ['An open source project', 'Made by 64 volunteers', 'Anyone can contribute', 'See who keeps it going'],
		label: 'Show the people behind this page',
		people: [
			{ name: 'Aminata Kamara', imageSrc: portrait },
			{ name: 'Lukas Meier' },
			{ name: 'Sara Rossi', imageSrc: portrait },
		],
		onClick: () => undefined,
	},
	parameters: {
		docs: {
			description: {
				component:
					'A pill that cycles through short lines and opens a panel, for example a `Backstage`. Pauses on hover and focus, and holds on the first line with reduced motion. Keep the lines about the same length: the pill sizes to the longest.',
			},
		},
	},
} satisfies Meta<typeof TickerPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutPeople: Story = {
	args: { people: [] },
};

export const SingleLine: Story = {
	args: { items: ['Made by 64 volunteers'] },
};
