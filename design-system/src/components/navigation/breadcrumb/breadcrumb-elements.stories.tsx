import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
	BreadcrumbElements,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from './breadcrumb-elements';

const meta = {
	title: 'Navigation/BreadcrumbElements',
	component: BreadcrumbElements,
	tags: ['autodocs'],
} satisfies Meta<typeof BreadcrumbElements>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<BreadcrumbElements>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/">Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<span>Current page</span>
				</BreadcrumbItem>
			</BreadcrumbList>
		</BreadcrumbElements>
	),
};
