import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LinkPill } from './link-pill';

const meta = {
	title: 'Actions/LinkPill',
	component: LinkPill,
	tags: ['autodocs'],
	args: {
		label: 'View impact data',
		href: '#',
	},
	parameters: {
		docs: {
			description: {
				component: 'A small link to more detail. With `onClick` instead of `href` it opens a dialog.',
			},
		},
	},
} satisfies Meta<typeof LinkPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OpensDialog: Story = {
	args: { href: undefined, label: 'View details', onClick: () => undefined },
};
