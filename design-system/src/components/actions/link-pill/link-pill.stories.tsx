import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CountryFlag } from '../../data-display/country-flag/country-flag';
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
				component:
					'A small link to more detail, with an optional leading icon. With `onClick` instead of `href` it opens a dialog.',
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

export const WithIcon: Story = {
	args: {
		label: 'Switzerland',
		href: '/countries/switzerland',
		icon: <CountryFlag country="CH" size="sm" decorative />,
	},
};
