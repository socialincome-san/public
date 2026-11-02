import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AnimatedLogo } from './animated-logo';

const meta = {
	title: 'Brand/Animated Logo',
	component: AnimatedLogo,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Social Income wordmark as a Lottie animation, in white for dark backgrounds or blue for light ones. Animates in once, the first time it is fully in view, and shows the final frame when reduced motion is preferred.',
			},
		},
	},
} satisfies Meta<typeof AnimatedLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const White: Story = {
	args: {
		src: 'https://a.storyblok.com/f/109655/x/880b0018b3/social_income_logo_animation_white.json',
	},
	decorators: [
		(Story) => (
			<div className="bg-primary rounded-3xl p-10">
				<Story />
			</div>
		),
	],
};

export const Blue: Story = {
	args: {
		src: 'https://a.storyblok.com/f/109655/x/64cfe94469/social_income_logo_animation_blue.json',
	},
};
