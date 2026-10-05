import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Button } from '../button/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';

const meta = {
	title: 'Components/Dialog',
	component: Dialog,
	tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

const DialogExample = () => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open dialog</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit profile</DialogTitle>
						<DialogDescription>Update the name shown on your public profile.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button onClick={() => setOpen(false)}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export const Default: Story = {
	render: () => <DialogExample />,
};
