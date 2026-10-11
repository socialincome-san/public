import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from '../badge/badge';
import { Wallet } from './wallet';

const flagImage = { src: '/assets/storybook/placeholder-portrait.svg', alt: 'Flag of Sierra Leone' };

const meta = {
	title: 'Data Display/Wallet',
	component: Wallet,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'A program wallet card with a stack of images, key figures and an optional link.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'empty'],
		},
	},
	args: {
		title: 'Sierra Leone Pilot',
		subtitle: 'Sierra Leone',
		href: '#',
		footerLeft: { label: 'Paid out', prefix: 'SLE', value: "1'250'000" },
		footerRight: { label: 'Recipients', value: '162' },
	},
} satisfies Meta<typeof Wallet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithImages: Story = {
	args: {
		images: { primaryImage: flagImage, hoverEffectImage1: flagImage, hoverEffectImage2: flagImage },
	},
};

export const WithBadge: Story = {
	args: {
		badge: <Badge variant="secondary">Funding needed</Badge>,
	},
};

export const Empty: Story = {
	args: {
		variant: 'empty',
		title: 'Create a new program',
		subtitle: undefined,
		footerLeft: undefined,
		footerRight: undefined,
	},
};
