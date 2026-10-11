import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Input } from '../../forms/input/input';
import { LoginFlyout } from './login-flyout';

const meta = {
	title: 'Navigation/LoginFlyout',
	component: LoginFlyout,
	tags: ['autodocs'],
} satisfies Meta<typeof LoginFlyout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		buttonLabel: 'Log in',
		title: 'Log in to Social Income',
		children: (
			<form className="flex flex-col gap-4">
				<Input type="email" placeholder="Email address" />
				<Button type="submit">Send login link</Button>
			</form>
		),
	},
};
