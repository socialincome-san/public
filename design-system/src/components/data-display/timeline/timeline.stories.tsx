import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Timeline } from './timeline';

const meta = {
	title: 'Data Display/Timeline',
	component: Timeline,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Steps of a journey as illustrated cards along a line. From medium screens the cards alternate around a middle line, each starting halfway down the previous one; on small screens the line runs on the left.',
			},
		},
	},
} satisfies Meta<typeof Timeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: (
			<>
				The path of your <strong>donation.</strong>
			</>
		),
		description: 'From you straight onto the recipients’ phones, every month.',
		items: [
			{
				eyebrow: 'With you',
				title: 'You donate',
				text: 'Monthly or once, with the payment method you prefer.',
				proof: 'Cancel any time',
				imageSrc: '/assets/storybook/timeline-donor.webp',
			},
			{
				eyebrow: 'On site',
				title: 'Straight onto the phone',
				text: 'Recipients get their income through mobile money. They don’t need a bank account.',
				proof: 'CHF 1.2M paid out so far',
				imageSrc: '/assets/storybook/timeline-recipient.webp',
			},
			{
				eyebrow: 'On site',
				title: 'They decide',
				text: 'People spend the money on what they need most.',
				imageSrc: '/assets/storybook/timeline-decide.webp',
			},
		],
	},
};

export const WithoutHeading: Story = {
	args: {
		items: Default.args.items.slice(0, 2),
	},
};
