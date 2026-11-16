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
					'Steps of a journey as cards along a line. From medium screens the cards alternate around a middle line, each starting halfway down the previous one; on small screens the line runs on the left. Illustration, eyebrow, description and badge are optional.',
			},
		},
	},
	args: {
		title: (
			<>
				The path of your <strong>donation.</strong>
			</>
		),
		description: 'From you straight onto the recipients’ phones, every month.',
		items: [
			{
				id: 'donate',
				eyebrow: 'With you',
				title: 'You donate',
				description: 'Monthly or once, with the payment method you prefer.',
				badge: 'Cancel anytime',
				imageSrc: '/assets/storybook/timeline-donor.webp',
			},
			{
				id: 'phone',
				eyebrow: 'With the recipients',
				title: 'Straight onto the phone',
				description: 'Recipients get their income through mobile money. They don’t need a bank account.',
				badge: 'CHF 1.2M paid out so far',
				imageSrc: '/assets/storybook/timeline-recipient.webp',
			},
			{
				id: 'decide',
				eyebrow: 'With the recipients',
				title: 'They decide',
				description: 'People spend the money on what they need most: food, school fees, health care, rent or savings.',
				badge: '102 people currently receive an income',
				imageSrc: '/assets/storybook/timeline-decide.webp',
			},
		],
	},
} satisfies Meta<typeof Timeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TextOnly: Story = {
	args: {
		title: 'How it works',
		description: undefined,
		items: [
			{ id: 'program', title: 'Pick a program', description: 'Choose the program your campaign supports.' },
			{
				id: 'story',
				title: 'Tell your story',
				description: 'Set a goal and an end date and tell people why you are fundraising.',
			},
			{
				id: 'share',
				title: 'Share your link',
				description: 'Everyone can donate in a few clicks. You see the progress live.',
			},
			{ id: 'paid', title: 'Recipients get paid', description: 'Every franc goes to the program you picked.' },
		],
	},
};
