import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';
import { ShowMoreToggle } from './show-more-toggle';

const referenceItems = [
	'Social Income Annual Report',
	'How direct cash transfers work',
	'Research on poverty reduction',
	'Community impact report',
	'Program evaluation results',
	'Recipient stories from Sierra Leone',
	'Financial transparency overview',
	'Frequently asked questions',
];

const meta = {
	title: 'Components/ShowMoreToggle',
	component: ShowMoreToggle,
	tags: ['autodocs'],
	args: {
		children: [],
		showMoreLabel: 'Show more',
		showLessLabel: 'Show less',
	},

	argTypes: {
		initialCount: {
			control: 'number',
		},
		showMoreLabel: {
			control: 'text',
		},
		showLessLabel: {
			control: 'text',
		},
		children: {
			control: false,
		},
	},
} satisfies Meta<typeof ShowMoreToggle>;

type Story = StoryObj<typeof meta>;
export default meta;

export const Collapsed: Story = {
	args: {
		initialCount: 3,
		showMoreLabel: 'Show more',
		showLessLabel: 'Show less',
	},
	render: (args) => (
		<ShowMoreToggle {...args}>
			{referenceItems.map((item) => (
				<p key={item}>{item}</p>
			))}
		</ShowMoreToggle>
	),
};

export const Expanded: Story = {
	args: {
		initialCount: 3,
		showMoreLabel: 'Show more',
		showLessLabel: 'Show less',
	},
	render: (args) => (
		<ShowMoreToggle {...args}>
			{referenceItems.map((item) => (
				<p key={item}>{item}</p>
			))}
		</ShowMoreToggle>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Show more' }));
	},
};

export const ShortList: Story = {
	args: {
		initialCount: 3,
		showMoreLabel: 'Show more',
		showLessLabel: 'Show less',
	},
	render: (args) => (
		<ShowMoreToggle {...args}>
			{referenceItems.slice(0, 2).map((item) => (
				<p key={item}>{item}</p>
			))}
		</ShowMoreToggle>
	),
};
