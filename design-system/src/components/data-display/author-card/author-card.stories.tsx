import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthorCard } from './author-card';

const meta = {
	title: 'Data Display/AuthorCard',
	component: AuthorCard,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="w-2xl max-w-full">
				<Story />
			</div>
		),
	],
	args: {
		name: 'Aminata Kamara',
		href: '#',
		image: { src: '/assets/storybook/placeholder-portrait.svg', alt: 'Aminata Kamara' },
		subtitle: { label: 'Author', count: { label: '12 articles', href: '#articles' }, detail: 'Program Lead' },
		description:
			'Aminata coordinates the basic income program in Sierra Leone and visits recipients every month. Before joining Social Income she worked for ten years in community health.',
		facts: [
			{ label: 'Volunteering since', value: 'Mar 2021' },
			{
				label: 'Active in',
				links: [
					{ label: 'Program Circle', href: '#program' },
					{ label: 'Storytelling Circle', href: '#storytelling' },
				],
			},
		],
		actionLabel: 'More about Aminata Kamara',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Introduces the author at the end of an article: who they are, where they help and how much they wrote, with a clear way to their profile. On phones the portrait sits next to the name.',
			},
		},
	},
} satisfies Meta<typeof AuthorCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Minimal: Story = {
	args: {
		image: null,
		subtitle: { label: 'Author' },
		description: undefined,
		facts: undefined,
	},
};
