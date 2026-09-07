import { Badge } from '@/components/badge/badge';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/Badge',
	component: Badge,
	tags: ['autodocs'],

	args: {
		children: 'Badge',
	},

	parameters: {
		docs: {
			description: {
				component: 'A badge displays short status or contextual information.',
			},
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=23-995&p=f&t=zjQYKr57x1DPvxtF-0',
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'secondary', 'outline', 'outline-solid', 'destructive', 'verified', 'country', 'video'],
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

export const Default: Story = {};

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
			<Badge variant="video">Video</Badge>
		</div>
	),
};
