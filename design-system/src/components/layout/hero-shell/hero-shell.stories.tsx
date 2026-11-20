import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { heroDescriptionVariants, HeroShell, heroTitleVariants } from './hero-shell';

const meta = {
	title: 'Layout/HeroShell',
	component: HeroShell,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The dark frame every hero shares: full width from the top of the page, behind the floating site header, with only the bottom corners rounded. `MediaHero` and `PersonHero` are built on it. `heroTitleVariants` and `heroDescriptionVariants` hold the type of a hero.',
			},
		},
	},
	args: {
		size: 'content',
		children: (
			<div className="text-primary-foreground w-site-width max-w-content mx-auto flex flex-col gap-4 py-24">
				<h1 className={heroTitleVariants({ variant: 'light' })}>
					Aminata
					<br />
					<strong>Kamara</strong>
				</h1>
				<p className={heroDescriptionVariants({ variant: 'light' })}>Program Lead</p>
			</div>
		),
	},
} satisfies Meta<typeof HeroShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Content: Story = {};

export const Media: Story = {
	args: { size: 'media' },
};

export const Expanded: Story = {
	args: { size: 'media', expanded: true },
};
