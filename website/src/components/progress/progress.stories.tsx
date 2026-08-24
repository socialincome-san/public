import { Progress } from '@/components/progress/progress';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/Progress',
	component: Progress,
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'urgent', 'onDark'],
		},
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=17086-207392&t=ewJikbvSUoKyyhiz-0',
		},
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	args: {
		value: 0,
	},
};

export const Partial: Story = {
	args: {
		value: 40,
	},
};

export const Complete: Story = {
	args: {
		value: 100,
	},
};

export const Urgent: Story = {
	args: {
		variant: 'urgent',
		value: 40,
	},
};

export const OnDark: Story = {
	args: {
		variant: 'onDark',
		value: 40,
	},
	render: (args) => (
		<div className="bg-black p-6">
			<Progress {...args} />
		</div>
	),
};
