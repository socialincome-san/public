import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LinkList } from '../../data-display/link-list/link-list';
import { TagList } from '../../data-display/tag-list/tag-list';
import { AsideSection } from './aside-section';

const meta = {
	title: 'Layout/Aside Section',
	component: AsideSection,
	tags: ['autodocs'],
	args: {
		title: 'Website contributions',
		description: 'Aminata helped create 4 pages on this website.',
		children: (
			<LinkList
				items={[
					{ label: 'Mission', href: '#mission', tags: ['Content'] },
					{ label: 'Sierra Leone', href: '#sierra-leone', tags: ['Research'] },
					{ label: 'How Social Income Works', href: '#how-it-works', tags: ['Translation'] },
					{ label: 'Poverty & Cash Transfers', href: '#poverty', tags: ['Content', 'Research'] },
				]}
				showMoreLabel="Show all"
				showLessLabel="Show fewer"
			/>
		),
	},
	parameters: {
		docs: {
			description: {
				component:
					'A section with its title, description and a summary on the left and the content on the right. On large screens the left column sticks while long content scrolls.',
			},
		},
	},
} satisfies Meta<typeof AsideSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAside: Story = {
	args: {
		aside: (
			<TagList
				items={[
					{ label: 'Content', count: 2 },
					{ label: 'Research', count: 2 },
					{ label: 'Translation', count: 1 },
				]}
			/>
		),
	},
};
