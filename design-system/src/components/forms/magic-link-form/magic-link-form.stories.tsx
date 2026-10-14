import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { MagicLinkForm } from './magic-link-form';

const meta = {
	title: 'Forms/MagicLinkForm',
	component: MagicLinkForm,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
	args: {
		title: 'Sign in to Social Income',
		description: 'One login for contributors, partners and program teams. We’ll take you to the right place.',
		emailLabel: 'Email',
		emailPlaceholder: 'you@example.org',
		submitLabel: 'Send login link',
		sendingLabel: 'Sending…',
		hint: 'We’ll send you a magic link to sign in.',
		onSubmit: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Passwordless sign-in: one email field that requests a magic link. Show `AuthStatus` once the link is on its way.',
			},
		},
	},
} satisfies Meta<typeof MagicLinkForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Prefilled: Story = {
	args: { defaultEmail: 'jane@example.org' },
};

export const Sending: Story = {
	args: { defaultEmail: 'jane@example.org', sending: true },
};

export const Invalid: Story = {
	args: { defaultEmail: 'jane@', error: 'Please enter a valid email address.' },
};
