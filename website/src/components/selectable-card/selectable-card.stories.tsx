import { useState, type ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SelectableCard } from './selectable-card';

const CardContent = ({ title, description }: { title: string; description: string }) => (
	<div className="space-y-1 p-4">
		<div className="font-medium">{title}</div>
		<div className="text-muted-foreground text-sm">{description}</div>
	</div>
);

type SelectableCardStoryProps = Omit<ComponentProps<typeof SelectableCard>, 'selected' | 'onSelect'>;

const InteractiveSelectableCard = (args: SelectableCardStoryProps & { selected?: boolean }) => {
	return <SelectableCard {...args} selected={args.selected ?? false} onSelect={() => undefined} />;
};

const SideBySideCards = () => {
	const [selected, setSelected] = useState('first');

	return (
		<div className="grid max-w-xl gap-4 sm:grid-cols-2">
			<SelectableCard selected={selected === 'first'} onSelect={() => setSelected('first')}>
				<CardContent title="Option one" description="Selected by default." />
			</SelectableCard>
			<SelectableCard selected={selected === 'second'} onSelect={() => setSelected('second')}>
				<CardContent title="Option two" description="Select this alternative." />
			</SelectableCard>
		</div>
	);
};

const meta = {
	title: 'Components/SelectableCard',
	component: InteractiveSelectableCard,
	tags: ['autodocs'],
	args: {
		selected: false,
		children: <CardContent title="Basic plan" description="A simple selectable card." />,
	},
	argTypes: {
		children: { control: false },
	},
} satisfies Meta<typeof InteractiveSelectableCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unselected: Story = {};

export const Selected: Story = {
	args: {
		selected: true,
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

export const SideBySide: Story = {
	render: () => <SideBySideCards />,
};
