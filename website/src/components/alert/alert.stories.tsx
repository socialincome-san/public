import { Alert, AlertDescription, AlertTitle } from '@/components/alert/alert';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/Alert',
	tags: ['autodocs'],
	component: Alert,
	args: {
		variant: 'default',
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'destructive'],
		},
	},
	parameters: {
		docs: {
			description: {
				component: 'A reusable alert component for displaying important messages or notifications to users.',
			},
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=21-322&p=f&t=zjQYKr57x1DPvxtF-0',
		},
	},
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<Alert {...args}>
			<AlertTitle>Default Alert</AlertTitle>
			<AlertDescription>This is a default alert message.</AlertDescription>
		</Alert>
	),
};
export const Destructive: Story = {
	args: {
		variant: 'destructive',
	},
	render: (args) => (
		<Alert {...args}>
			<AlertTitle>Destructive Alert</AlertTitle>
			<AlertDescription>This is a destructive alert message.</AlertDescription>
		</Alert>
	),
};
