import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CertificationBadge } from './certification-badge';

const meta = {
	title: 'Data Display/CertificationBadge',
	component: CertificationBadge,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'A certification seal with its name, linking to the certifier. Opens in a new tab.',
			},
		},
	},
} satisfies Meta<typeof CertificationBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Zewo: Story = {
	args: {
		label: 'ZEWO certified',
		imageSrc: '/assets/storybook/zewo.svg',
		href: 'https://www.zewo.ch',
	},
};
