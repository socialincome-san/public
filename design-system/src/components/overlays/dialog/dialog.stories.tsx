import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ComponentProps } from 'react';

import { Button } from '../../actions/button/button';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';

const meta = {
	title: 'Overlays/Dialog',
	component: Dialog,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A centered dialog on desktop and a bottom drawer on mobile (below the `sm` breakpoint) that closes with a swipe down. `size` only sets the desktop width: `sm` for confirmations and short messages, `md` for forms and content, `lg` for editors, wizards and media. Turn `dismissible` off while work is in flight, so nothing closes it halfway.',
			},
		},
	},
	args: {
		open: false,
		onOpenChange: () => undefined,
		children: null,
	},
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

const DialogExample = ({ size }: Pick<ComponentProps<typeof DialogContent>, 'size'>) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open dialog</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent size={size}>
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

export const Small: Story = {
	render: () => <DialogExample size="sm" />,
};

export const Medium: Story = {
	render: () => <DialogExample size="md" />,
};

export const Large: Story = {
	render: () => <DialogExample size="lg" />,
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

const ConfirmationExample = () => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button variant="destructive" onClick={() => setOpen(true)}>
				Delete
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent hideCloseButton>
					<DialogHeader divided={false}>
						<DialogTitle>Delete this entry?</DialogTitle>
						<DialogDescription>This cannot be undone.</DialogDescription>
					</DialogHeader>
					<DialogFooter divided={false}>
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

export const Confirmation: Story = {
	render: () => <ConfirmationExample />,
};

const NotDismissibleExample = () => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Start upload</Button>
			<Dialog open={open} onOpenChange={setOpen} dismissible={false}>
				<DialogContent>
					<DialogHeader divided={false}>
						<DialogTitle>Uploading…</DialogTitle>
						<DialogDescription>No close button, outside click, Escape or swipe until the work is done.</DialogDescription>
					</DialogHeader>
					<DialogFooter divided={false}>
						<Button onClick={() => setOpen(false)}>Finish</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export const NotDismissible: Story = {
	render: () => <NotDismissibleExample />,
};

export const MobileDrawer: Story = {
	parameters: {
		viewport: { defaultViewport: 'mobile1' },
	},
	render: () => <ScrollingDialogExample />,
};
