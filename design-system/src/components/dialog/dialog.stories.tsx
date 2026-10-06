import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Button } from '../button/button';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';

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

const ScrollingDialogExample = () => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open dialog with long content</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent size="md" height="fixed">
					<DialogHeader>
						<DialogTitle size="lg">Terms of service</DialogTitle>
						<DialogDescription>The header and footer stay visible while the body scrolls.</DialogDescription>
					</DialogHeader>
					<DialogBody>
						{Array.from({ length: 30 }, (_, index) => (
							<p key={index} className="py-2 text-sm">
								Paragraph {index + 1}
							</p>
						))}
					</DialogBody>
					<DialogFooter>
						<Button onClick={() => setOpen(false)}>Accept</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export const ScrollingBody: Story = {
	render: () => <ScrollingDialogExample />,
};

const AlertDialogExample = () => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button variant="destructive" onClick={() => setOpen(true)}>
				Delete
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent size="alert" hideCloseButton>
					<DialogHeader>
						<DialogTitle>Delete this entry?</DialogTitle>
						<DialogDescription>This cannot be undone.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={() => setOpen(false)}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export const Alert: Story = {
	render: () => <AlertDialogExample />,
};
