import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LoginLink } from './login-link';

const meta = {
	title: 'Navigation/LoginLink',
	component: LoginLink,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'The login entry in the site header. Links to the login page, where all sign-ins happen.',
			},
		},
	},
} satisfies Meta<typeof LoginLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		href: '/login',
		label: 'Login',
	},
};
