import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EmailPreview } from './email-preview';

const meta = {
	title: 'Data Display/Email Preview',
	component: EmailPreview,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="w-[640px] max-w-full">
				<Story />
			</div>
		),
	],
	args: {
		headers: [
			{ label: 'From', value: 'hello@socialincome.org' },
			{ label: 'To', value: 'staff@socialincome.org' },
			{ label: 'Subject', value: 'Campaign created: Run for Sierra Leone' },
		],
		body: `Hi,

Alex Creator created the campaign "Run for Sierra Leone". The campaign page is live.

Goal: CHF 5000
Ends: 2027-03-31

Campaign: https://socialincome.org/en/int/campaigns/run-for-sierra-leone`,
	},
	parameters: {
		docs: {
			description: {
				component: 'Shows a plain-text email with its envelope lines, e.g. to preview a notification with sample data.',
			},
		},
	},
} satisfies Meta<typeof EmailPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFootnote: Story = {
	args: { footnote: 'SendGrid renders template d-215d4d09 instead; this is the plain-text fallback stored in the log.' },
};

export const MissingReceivers: Story = {
	args: {
		headers: [
			{ label: 'From', value: 'hello@socialincome.org' },
			{ label: 'To', value: '' },
			{ label: 'Subject', value: 'Monthly summary — October 2026' },
		],
	},
};
