import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LinkList } from './link-list';

const items = [
	{ label: 'Mission', href: '#mission', tags: ['Content'] },
	{ label: 'Sierra Leone', href: '#sierra-leone', tags: ['Research'] },
	{ label: 'How Social Income Works', href: '#how-it-works', tags: ['Translation'] },
	{ label: 'Poverty & Cash Transfers', href: '#poverty', tags: ['Content', 'Research'] },
	{ label: 'Open Source', href: '#open-source', tags: ['Development'] },
	{ label: 'Transparency', href: '#transparency', tags: ['Content', 'UX Design'] },
	{ label: 'Liberia', href: '#liberia', tags: ['Research', 'Translation'] },
];

const meta = {
	title: 'Data Display/Link List',
	component: LinkList,
	tags: ['autodocs'],
	args: {
		items,
		showMoreLabel: 'Show all 7 pages',
		showLessLabel: 'Show fewer pages',
	},
	parameters: {
		docs: {
			description: {
				component:
					'A divided list of links with optional tags on the right. Long lists show the first items and reveal the rest in place.',
			},
		},
	},
} satisfies Meta<typeof LinkList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Short: Story = {
	args: { items: items.slice(0, 3) },
};

export const WithoutTags: Story = {
	args: { items: items.map(({ label, href }) => ({ label, href })) },
};
