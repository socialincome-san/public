import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar, AvatarFallback } from './avatar';

const meta = {
	title: 'Components/Avatar',
	tags: ['autodocs'],
	component: Avatar,
	parameters: {
		docs: {
			description: {
				component: 'A reusable avatar component for displaying user profile images.',
			},
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=23-988&p=f&t=zjQYKr57x1DPvxtF-0',
		},
	},
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<Avatar {...args}>
			<AvatarFallback>AB</AvatarFallback>
		</Avatar>
	),
};
