import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';

const meta = {
	title: 'Overlays/Command',
	component: Command,
	tags: ['autodocs'],
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="w-80 rounded-lg border">
			<Command>
				<CommandInput placeholder="Search components" />
				<CommandList>
					<CommandEmpty>No results.</CommandEmpty>
					<CommandGroup>
						<CommandItem>Button</CommandItem>
						<CommandItem>Dialog</CommandItem>
						<CommandItem>Input</CommandItem>
					</CommandGroup>
				</CommandList>
			</Command>
		</div>
	),
};
