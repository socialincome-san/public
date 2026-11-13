import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BadgeCheck } from 'lucide-react';
import { FootnoteCard, FootnoteCardLink } from './footnote-card';

const meta = {
	title: 'Data Display/FootnoteCard',
	component: FootnoteCard,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'A bordered card with an optional muted footnote strip, e.g. to credit who reviewed the content.',
			},
		},
	},
	args: {
		children: 'Empowering communities through direct cash transfers.',
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof FootnoteCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFootnote: Story = {
	args: {
		footnoteIcon: BadgeCheck,
		footnote: (
			<>
				NGO assessment led by <FootnoteCardLink href="#">Jane Doe</FootnoteCardLink>, reviewed by{' '}
				<FootnoteCardLink href="#">John Smith</FootnoteCardLink>
			</>
		),
	},
};
