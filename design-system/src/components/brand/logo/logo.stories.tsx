import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AnimatedSILogoIcon, SILogo, SocialIncomeLogo } from './logo';

const meta = {
	title: 'Brand/Logo',
	component: SocialIncomeLogo,
	tags: ['autodocs'],
} satisfies Meta<typeof SocialIncomeLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Wordmark: Story = {};

export const Variants: Story = {
	render: () => (
		<div className="text-primary flex items-center gap-10">
			<SocialIncomeLogo />
			<SILogo />
			<AnimatedSILogoIcon />
		</div>
	),
};
