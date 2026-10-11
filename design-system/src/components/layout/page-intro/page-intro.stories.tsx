import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PageIntro } from './page-intro';

const meta = {
	title: 'Layout/PageIntro',
	component: PageIntro,
	tags: ['autodocs'],
	args: {
		title: 'Our programs',
		description:
			'Each program pays an unconditional basic income to people living in poverty, together with a local partner.',
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'The title and lead text at the top of an overview page. Renders nothing without both.',
			},
		},
	},
} satisfies Meta<typeof PageIntro>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
	args: { description: undefined },
};
