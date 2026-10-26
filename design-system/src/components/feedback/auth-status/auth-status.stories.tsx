import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import NextLink from 'next/link';
import { Button } from '../../actions/button/button';
import { AuthStatus } from './auth-status';

const meta = {
	title: 'Feedback/AuthStatus',
	component: AuthStatus,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					'A step of a sign-in flow that needs no input: the link was sent, the visitor confirms the sign-in, the sign-in is running or it failed.',
			},
		},
	},
} satisfies Meta<typeof AuthStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sent: Story = {
	args: {
		status: 'sent',
		title: 'Check your inbox',
		description: (
			<>
				If an account exists for <strong>jane@example.org</strong>, we’ve sent you a link to sign in.
			</>
		),
		hint: 'Nothing arrived? Check your spam folder.',
		children: (
			<Button variant="outline" size="md" fullWidth>
				Use a different email
			</Button>
		),
	},
};

export const Confirm: Story = {
	args: {
		status: 'confirm',
		title: 'Complete sign in',
		description: 'Click the button below to complete sign in.',
		children: (
			<>
				<Button size="md" fullWidth>
					Complete sign in
				</Button>
				<Button variant="ghost" size="md" fullWidth asChild>
					<NextLink href="/">Return home</NextLink>
				</Button>
			</>
		),
	},
};

export const Loading: Story = {
	args: {
		status: 'loading',
		title: 'Signing you in…',
		description: 'This only takes a moment.',
	},
};

export const Failed: Story = {
	args: {
		status: 'error',
		title: 'Sign in failed',
		description: 'The link is invalid or has already been used. Request a new one to sign in.',
		children: (
			<Button size="md" fullWidth asChild>
				<NextLink href="/login">Request a new link</NextLink>
			</Button>
		),
	},
};
