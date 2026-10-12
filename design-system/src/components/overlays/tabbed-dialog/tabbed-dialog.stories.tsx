import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ComponentProps } from 'react';
import { fn } from 'storybook/test';

import { Button } from '../../actions/button/button';
import { TabbedDialog, type TabbedDialogTab } from './tabbed-dialog';

const meta = {
	title: 'Overlays/Tabbed Dialog',
	component: TabbedDialog,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Dialog for one record with related data in tabs, for example a person with their details and their payments. The header and tabs stay visible while the active tab scrolls. A tab mounts when it is first opened, so its data loads only when needed, and then stays mounted, so unsaved input survives a tab switch.',
			},
		},
	},
	args: {
		open: false,
		onOpenChange: fn(),
		title: 'Aminata Kamara',
		tabs: [],
	},
} satisfies Meta<typeof TabbedDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

const longList = (label: string) =>
	Array.from({ length: 30 }, (_, index) => (
		<p key={index} className="py-2 text-sm">
			{label} {index + 1}
		</p>
	));

const recordTabs: TabbedDialogTab[] = [
	{ value: 'details', label: 'Details', content: <p className="text-sm">Form for the record goes here.</p> },
	{ value: 'payments', label: 'Payments', content: longList('Payment') },
	{ value: 'surveys', label: 'Surveys', content: longList('Survey') },
];

const TabbedDialogExample = (args: ComponentProps<typeof TabbedDialog>) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open record</Button>
			<TabbedDialog {...args} open={open} onOpenChange={setOpen} />
		</>
	);
};

export const Default: Story = {
	args: { tabs: recordTabs },
	render: (args) => <TabbedDialogExample {...args} />,
};

export const WithDescription: Story = {
	args: { tabs: recordTabs, description: 'Program Sierra Leone 2024 · Active' },
	render: (args) => <TabbedDialogExample {...args} />,
};

export const OpenOnSecondTab: Story = {
	args: { tabs: recordTabs, defaultTab: 'payments' },
	render: (args) => <TabbedDialogExample {...args} />,
};
