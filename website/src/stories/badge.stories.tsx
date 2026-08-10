import { Badge } from '@/components/badge';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

const meta = {
	title: 'Components/Badge',
	component: Badge,
	args: {
		children: 'Badge',
	},

	tags: ['autodocs'],
	parameters: {
		docs: {
			codePanel: true,
			description: {
				component: 'Ein Badge kennzeichnet kurze Status- oder Kontextinformationen.',
			},
			source: {
				code: '<Badge variant="verified">Verified</Badge>',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'secondary', 'outline', 'outline-solid', 'destructive', 'verified', 'country'],
		},
		children: {
			control: 'text',
		},
		className: {
			control: 'text',
		},
	},
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		const badge = await canvas.findByText('Badge');
		await expect(badge).toBeVisible();
	},
};

export const Variants: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge>Default</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="outline">Outline</Badge>
			<Badge variant="outline-solid">Outline Solid</Badge>
			<Badge variant="destructive">Destructive</Badge>
			<Badge variant="verified">Verified</Badge>
			<Badge variant="country">Country</Badge>
		</div>
	),
};
