import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SummaryHeading } from './summary-heading';

const meta = {
	title: 'Data Display/SummaryHeading',
	component: SummaryHeading,
	tags: ['autodocs'],
	args: {
		title: '162 recipients',
		detail: 'in 3 programs',
	},
	parameters: {
		docs: {
			description: {
				component: 'The headline figure of a card, with an optional smaller detail at the end of the line.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SummaryHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDetail: Story = {
	args: { title: '3 programs', detail: undefined },
};
