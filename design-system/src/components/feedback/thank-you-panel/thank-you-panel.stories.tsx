import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { ThankYouPanel } from './thank-you-panel';

const meta = {
	title: 'Feedback/ThankYouPanel',
	component: ThankYouPanel,
	tags: ['autodocs'],
	args: {
		message: 'Thank you for your donation',
		title: 'Follow your impact',
		description: 'Log in to see your contributions and download your donation certificate.',
		action: <Button>Log in</Button>,
		support: { prefix: 'Questions? Write to', email: 'support@socialincome.org' },
	},
	parameters: {
		docs: {
			description: {
				component: 'Confirms a completed action, such as a donation, and points to the next step.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-[28rem]">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ThankYouPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActionHint: Story = {
	args: {
		padding: 'compact',
		title: 'Your campaign is live',
		description: 'We sent a link to manage it to jane@example.org.',
		actionHint: 'Didn’t get the email?',
		action: <Button>Send again</Button>,
	},
};
