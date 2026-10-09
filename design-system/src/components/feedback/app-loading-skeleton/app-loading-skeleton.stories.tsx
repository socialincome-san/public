import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AppLoadingSkeleton } from './app-loading-skeleton';

const meta = {
	title: 'Feedback/AppLoadingSkeleton',
	component: AppLoadingSkeleton,
	tags: ['autodocs'],
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppLoadingSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Card: Story = {};

export const Page: Story = {
	args: { variant: 'page', message: 'Loading your dashboard…' },
};
