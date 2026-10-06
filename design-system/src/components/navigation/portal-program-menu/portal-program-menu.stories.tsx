import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PortalProgramMenu } from './portal-program-menu';

const meta = {
	title: 'Navigation/PortalProgramMenu',
	component: PortalProgramMenu,
	tags: ['autodocs'],
	args: {
		variant: 'bar',
		label: 'Programs',
		active: true,
		programs: [
			{ href: '/portal/programs/sierra-leone/overview', label: 'Sierra Leone' },
			{ href: '/portal/programs/liberia/overview', label: 'Liberia' },
		],
		emptyLabel: 'No programs',
		createProgramLabel: 'Create new program',
		renderCreateProgram: (trigger) => <div>{trigger}</div>,
	},
} satisfies Meta<typeof PortalProgramMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bar: Story = {};

export const Menu: Story = {
	args: { variant: 'menu' },
};

export const Empty: Story = {
	args: { programs: [], active: false },
};
