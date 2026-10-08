import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AvatarStack } from './avatar-stack';

const portrait = '/assets/storybook/placeholder-portrait.svg';

const meta = {
	title: 'Data Display/AvatarStack',
	component: AvatarStack,
	tags: ['autodocs'],
	args: {
		people: [
			{ name: 'Aminata Kamara', imageSrc: portrait },
			{ name: 'Lukas Meier' },
			{ name: 'Sara Rossi', imageSrc: portrait },
			{ name: 'Nando Schär' },
		],
	},
	parameters: {
		docs: {
			description: {
				component:
					'Overlapping faces for a group of people. Decorative: name the people in text next to it. People without a photo show their initials.',
			},
		},
	},
} satisfies Meta<typeof AvatarStack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExtraSmall: Story = {
	args: { size: 'xs' },
};

export const ExtraLarge: Story = {
	args: { size: 'xl' },
};
