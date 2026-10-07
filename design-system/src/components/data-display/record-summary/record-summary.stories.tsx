import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Badge } from '../badge/badge';
import { RecordSummary } from './record-summary';

const meta = {
	title: 'Data Display/RecordSummary',
	component: RecordSummary,
	tags: ['autodocs'],
	args: {
		title: 'payout_confirmation_en',
		identifier: 'HX3f8c2a9b1d4e7f6a5b4c3d2e1f0a9b8c',
		externalLink: { href: '#', label: 'View in Twilio' },
		aside: <Button>Send message</Button>,
		columns: 4,
		fields: [
			{ label: 'Language', value: 'en' },
			{ label: 'Content type', value: 'twilio/text' },
			{ label: 'Variables', value: 2 },
			{ label: 'Supported channels', badges: ['SMS', 'WHATSAPP'] },
		],
		section: {
			title: 'Message body',
			content: 'Hello {{1}}, your payout of {{2}} is on its way.',
		},
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'The header of a detail page: title, identifier, key fields and one content section.',
			},
		},
	},
} satisfies Meta<typeof RecordSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBadges: Story = {
	args: {
		aside: (
			<>
				<Badge variant="default">SMS</Badge>
				<Badge variant="verified">completed</Badge>
			</>
		),
		columns: 5,
		fields: [
			{ label: 'Recipient type', value: 'recipients' },
			{ label: 'Total selected', value: 162 },
			{ label: 'Sent', value: 160 },
			{ label: 'Delivered', value: 158 },
			{ label: 'Failed', value: 2 },
		],
	},
};
