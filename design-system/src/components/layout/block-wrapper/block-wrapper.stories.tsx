import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BlockWrapper } from './block-wrapper';

const meta = {
	title: 'Layout/BlockWrapper',
	component: BlockWrapper,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Centers a page section within the site width. `marginTop` and `marginBottom` set responsive vertical spacing from `none` to `xl` (the default). `width="bleed"` lets the content run to the screen edges from tablet width up, for carousels.',
			},
		},
	},
} satisfies Meta<typeof BlockWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

const children = 'Page content stays inside the site width.';

export const None: Story = {
	args: {
		marginTop: 'none',
		marginBottom: 'none',
		children,
	},
};

export const Small: Story = {
	args: {
		marginTop: 'sm',
		marginBottom: 'sm',
		children,
	},
};

export const Medium: Story = {
	args: {
		marginTop: 'md',
		marginBottom: 'md',
		children,
	},
};

export const Large: Story = {
	args: {
		marginTop: 'lg',
		marginBottom: 'lg',
		children,
	},
};

export const ExtraLarge: Story = {
	args: {
		marginTop: 'xl',
		marginBottom: 'xl',
		children,
	},
};

export const Bleed: Story = {
	args: {
		width: 'bleed',
		marginTop: 'none',
		marginBottom: 'none',
		children: 'From tablet width up, this content runs to the screen edges.',
	},
};
