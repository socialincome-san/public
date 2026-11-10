import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CertificationBadge } from './certification-badge';

const meta = {
	title: 'Data Display/Certification Badge',
	component: CertificationBadge,
	tags: ['autodocs'],
	args: {
		label: 'ZEWO certified',
		imageSrc: '/assets/storybook/zewo.svg',
		href: 'https://zewo.ch',
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: "A certifier's seal with a label, linking to the certification in a new tab.",
			},
		},
	},
} satisfies Meta<typeof CertificationBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
