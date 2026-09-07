import { useState, type ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Tabs, TabsList, TabsTrigger } from './tabs';

type TabItem = {
	value: string;
	label: string;
	content: string;
	disabled?: boolean;
};

const TabsExample = ({ args, items }: { args: ComponentProps<typeof Tabs>; items: TabItem[] }) => {
	const defaultValue = String(args.defaultValue ?? '');
	const initialValue = items.some((item) => item.value === defaultValue) ? defaultValue : items[0].value;

	const [value, setValue] = useState(initialValue);
    
	return (
		<Tabs {...args} value={value} onValueChange={setValue}>
			<TabsList>
				{items.map((item) => (
					<TabsTrigger key={item.value} value={item.value} disabled={item.disabled}>
						{item.label}
					</TabsTrigger>
				))}
			</TabsList>

			<p className="pt-3 text-sm">{items.find((item) => item.value === value)?.content}</p>
		</Tabs>
	);
};

const twoTabs: TabItem[] = [
	{ value: 'overview', label: 'Overview', content: 'Overview content' },
	{ value: 'details', label: 'Details', content: 'Details content' },
];

const severalTabs: TabItem[] = [
	{ value: 'account', label: 'Account', content: 'Account content' },
	{ value: 'security', label: 'Security', content: 'Security content' },
	{ value: 'notifications', label: 'Notifications', content: 'Notification settings' },
];

const meta = {
	title: 'Components/Tabs',
	component: Tabs,
	tags: ['autodocs'],
	args: {
		defaultValue: 'overview',
	},
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoTabs: Story = {
	render: (args) => <TabsExample args={args} items={twoTabs} />,
};

export const SeveralTabs: Story = {
	render: (args) => <TabsExample args={args} items={severalTabs} />,
};

export const DisabledTrigger: Story = {
	args: {
		defaultValue: 'available',
	},
	render: (args) => (
		<TabsExample
			args={args}
			items={[
				{ value: 'available', label: 'Available', content: 'Available content' },
				{ value: 'disabled', label: 'Disabled', content: 'Disabled content', disabled: true },
			]}
		/>
	),
};
