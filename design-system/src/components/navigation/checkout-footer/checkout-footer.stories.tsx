import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../../actions/button/button';
import { CheckoutFooter } from './checkout-footer';

const meta = {
	title: 'Navigation/CheckoutFooter',
	component: CheckoutFooter,
	tags: ['autodocs'],
	args: {
		back: (
			<Button variant="outline">
				<ChevronLeft className="size-4" aria-hidden />
				Back
			</Button>
		),
		primary: <Button>Continue to payment</Button>,
		summary: { label: 'Your donation', amount: 'CHF 40', suffix: 'per month' },
	},
	parameters: {
		docs: {
			description: {
				component:
					'The footer of a donation step: back, the primary action and the amount being donated. On small screens the amount moves above the buttons.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-[40rem] max-w-full">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof CheckoutFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSummary: Story = {
	args: { summary: undefined },
};

export const PrimaryOnly: Story = {
	args: { back: undefined, summary: undefined, primary: <Button>Show QR bill</Button> },
};
