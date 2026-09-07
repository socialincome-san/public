import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';

const meta = {
	title: 'Components/Button',
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
			options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'confirmed'],
		},
		size: {
			control: 'select',
			options: ['default', 'sm', 'lg', 'icon'],
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
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
			<Button variant="confirmed">Confirmed</Button>
			<Button variant="destructive">Destructive</Button>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button size="sm">Small</Button>
			<Button>Default</Button>
			<Button size="lg">Large</Button>
			<Button aria-label="Favorite" size="icon">
				<span aria-hidden="true">+</span>
			</Button>
		</div>
	),
};

export const Disabled: Story = {
	args: {
		children: 'Disabled',
		disabled: true,
	},
};
