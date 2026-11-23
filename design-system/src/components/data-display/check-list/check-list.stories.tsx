import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckList } from './check-list';

const meta = {
	title: 'Data Display/Check List',
	component: CheckList,
	tags: ['autodocs'],
	args: {
		items: ['1 person gets an income, 6 more benefit', 'Cancel anytime', '88 % reaches recipients directly'],
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Short benefits, each with a check mark. An item can show a seal with a link instead, e.g. a certification.',
			},
		},
	},
} satisfies Meta<typeof CheckList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
	args: { size: 'sm' },
};

export const Large: Story = {
	args: { size: 'lg' },
};

export const WithSeal: Story = {
	args: {
		size: 'lg',
		items: [
			'Cancel anytime',
			'88 % reaches recipients directly',
			{ label: 'ZEWO certified', imageSrc: '/assets/storybook/zewo.svg', href: 'https://zewo.ch' },
		],
	},
};
