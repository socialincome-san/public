import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PersonCircles } from './person-circles';

const circle = (name: string) => ({ label: `${name} Circle`, href: `#${name.toLowerCase()}` });
const circles = ['Technology', 'Partnership', 'Operation', 'Community', 'Finance', 'Communication', 'Research', 'Design'];

const meta = {
	title: 'Data Display/PersonCircles',
	component: PersonCircles,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A round portrait with the circles a person belongs to as discs overlapping its edge: filled for circles they are active in, outlined for circles they are interested in. Made for dark surfaces. It scales with its width; discs appear one after another and drift slightly, unless the user prefers reduced motion.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="bg-foreground w-[36rem] max-w-full rounded-3xl p-6">
				<Story />
			</div>
		),
	],
	args: {
		image: { src: '/assets/storybook/placeholder-portrait.svg', alt: 'Aminata Kamara' },
		initials: 'AK',
		activeCircles: circles.slice(0, 4).map(circle),
		interestedCircles: circles.slice(4, 6).map(circle),
		legend: { active: 'Active Member', interested: 'Follower' },
		more: { href: '#circles', getLabel: (count: number) => `${count} more circles` },
	},
} satisfies Meta<typeof PersonCircles>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneCircle: Story = {
	args: { activeCircles: [circle('Technology')], interestedCircles: [] },
};

export const TwoCircles: Story = {
	args: { activeCircles: circles.slice(0, 2).map(circle), interestedCircles: [] },
};

export const ThreeCircles: Story = {
	args: { activeCircles: circles.slice(0, 3).map(circle), interestedCircles: [circle('Finance')] },
};

export const SixCircles: Story = {
	args: { activeCircles: circles.slice(0, 6).map(circle), interestedCircles: [] },
};

export const ManyCircles: Story = {
	args: { activeCircles: circles.map(circle), interestedCircles: circles.slice(0, 4).map(circle) },
};

export const NoCircles: Story = {
	args: { activeCircles: [], interestedCircles: [] },
};

export const WithoutPhoto: Story = {
	args: { image: null, activeCircles: [circle('Technology')], interestedCircles: [] },
};

export const Small: Story = {
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
};
