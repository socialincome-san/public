import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PartnershipBadge } from './partnership-badge';

const meta = {
	title: 'Components/PartnershipBadge',
	component: PartnershipBadge,
	tags: ['autodocs'],
	args: {
		name: 'Example Partner',
		href: 'https://example.com',
		logoSrc: 'https://placehold.co/32x32',
		logoAlt: 'Example Partner icon',
	},
} satisfies Meta<typeof PartnershipBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLogo: Story = {
	args: {
		logoSrc: undefined,
		logoAlt: undefined,
	},
};
