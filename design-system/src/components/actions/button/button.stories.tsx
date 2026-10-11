import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';

const meta = {
	title: 'Actions/Button',
	component: Button,
	tags: ['autodocs'],
	args: {
		children: 'Donate now',
	},
	parameters: {
		docs: {
			description: {
				component: 'A reusable button component for user interactions.',
			},
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=34-6&p=f&t=zjQYKr57x1DPvxtF-0',
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'default',
				'destructive',
				'destructive-outline',
				'outline',
				'outline-inverse',
				'overlay',
				'secondary',
				'foreground',
				'ghost',
				'link',
				'confirmed',
			],
		},
		size: {
			control: 'select',
			options: ['default', 'sm', 'md', 'lg', 'icon-sm', 'icon', 'icon-lg', 'inline'],
		},
		fullWidth: {
			control: 'boolean',
		},
	},
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button>Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="foreground">Foreground</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
			<Button variant="confirmed">Confirmed</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="destructive-outline">Destructive outline</Button>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button size="sm">Small</Button>
			<Button size="md">Medium</Button>
			<Button>Default</Button>
			<Button size="lg">Large</Button>
			<Button aria-label="Favorite" size="icon-sm">
				<span aria-hidden="true">+</span>
			</Button>
			<Button aria-label="Favorite" size="icon">
				<span aria-hidden="true">+</span>
			</Button>
			<Button aria-label="Favorite" size="icon-lg">
				<span aria-hidden="true">+</span>
			</Button>
		</div>
	),
};

export const OnMedia: Story = {
	render: () => (
		<div className="bg-foreground flex items-center gap-3 rounded-3xl p-8">
			<Button variant="outline-inverse" size="lg">
				Donate now
			</Button>
			<Button variant="overlay" size="icon-lg" aria-label="Play video">
				<span aria-hidden="true">▶</span>
			</Button>
		</div>
	),
};

export const FullWidth: Story = {
	args: {
		fullWidth: true,
	},
};

export const Disabled: Story = {
	args: {
		children: 'Disabled',
		disabled: true,
	},
};
