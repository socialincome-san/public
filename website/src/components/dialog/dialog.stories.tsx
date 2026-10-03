import { Button } from '@/components/button/button';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ComponentProps } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';

const DialogExample = (args: ComponentProps<typeof DialogContent>) => (
	<Dialog>
		<DialogPrimitive.Trigger asChild>
			<Button>Open dialog</Button>
		</DialogPrimitive.Trigger>
		<DialogContent {...args}>
			<DialogHeader>
				<DialogTitle>Confirm your changes</DialogTitle>
				<DialogDescription>Review the information before continuing.</DialogDescription>
			</DialogHeader>
			<p className="text-sm">This is an example dialog with a title, description, and close button.</p>
		</DialogContent>
	</Dialog>
);

const ToggleableDialogExample = (args: ComponentProps<typeof DialogContent>) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogPrimitive.Trigger asChild>
				<Button>Open dialog</Button>
			</DialogPrimitive.Trigger>
			<DialogContent {...args}>
				<DialogHeader>
					<DialogTitle>Open dialog</DialogTitle>
					<DialogDescription>This dialog can be opened and closed with the trigger or close button.</DialogDescription>
				</DialogHeader>
				<p className="text-sm">The dialog content is visible while the dialog is open.</p>
			</DialogContent>
		</Dialog>
	);
};

const meta = {
	title: 'Components/Dialog',
	component: DialogExample,
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'large'],
		},
		hasGradient: {
			control: 'boolean',
		},
	},
} satisfies Meta<typeof DialogExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => <DialogExample {...args} />,
};

export const Large: Story = {
	args: {
		variant: 'large',
	},
	render: (args) => <DialogExample {...args} />,
};

export const WithGradient: Story = {
	args: {
		hasGradient: true,
	},
	render: (args) => <DialogExample {...args} />,
};

export const ClosedVsOpen: Story = {
	render: (args) => <ToggleableDialogExample {...args} />,
};
