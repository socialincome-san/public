import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { FallbackPage } from './fallback-page';

const meta = {
	title: 'Feedback/FallbackPage',
	component: FallbackPage,
	tags: ['autodocs'],
	parameters: { layout: 'fullscreen' },
	args: {
		eyebrow: '404',
		title: 'Page not found',
		description: 'The page you are looking for does not exist or has moved.',
	},
} satisfies Meta<typeof FallbackPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
	args: {
		children: <Button>Back to home</Button>,
		detail: 'Error code: 404',
	},
};
