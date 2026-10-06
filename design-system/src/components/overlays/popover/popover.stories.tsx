import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '../../actions/button/button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
	title: 'Overlays/Popover',
	component: Popover,
	tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Open popover</Button>
			</PopoverTrigger>
			<PopoverContent>Choose a region and currency for the public site.</PopoverContent>
		</Popover>
	),
};
