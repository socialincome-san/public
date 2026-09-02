import { PartnershipBadge } from '@/components/partnership-badge/partnership-badge';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/PartnershipBadge',
	component: PartnershipBadge,
	tags: ['autodocs'],
} satisfies Meta<typeof PartnershipBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		partnership: {
			name: 'Example Partner',
			logo: {
				alt: null,
				fieldtype: 'asset',
				id: null,
				filename: 'http://placehold.co/64x64',
				name: 'Example logo',
				title: null,
				focus: null,
			},
			logoIcon: {
				alt: 'Example Partner icon',
				fieldtype: 'asset',
				title: null,
				focus: null,
				id: null,
				name: 'Example icon',
				filename: 'https://placehold.co/32x32',
			},
			website: {
				fieldtype: 'multilink',
				id: '',
				linktype: 'url',
				url: 'https://example.com',
				cached_url: 'https://example.com',
			},
			component: 'partnership',
			_uid: 'example-partnership',
		},
	},
};
