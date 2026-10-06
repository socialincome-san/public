'use client';

import { UserRound } from 'lucide-react';
import { Fragment, type ReactNode, useState } from 'react';
import { Button } from '../../actions/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../overlays/dialog/dialog';

type LoginFlyoutProps = {
	buttonLabel?: string;
	title?: string;
	children: ReactNode;
};

export const LoginFlyout = ({ buttonLabel, title, children }: LoginFlyoutProps) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button data-testid="login-button" onClick={() => setOpen(true)} variant="ghost" size="md">
				<UserRound />
				{buttonLabel}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>

					{/* Remount the content on every open so the form starts fresh */}
					<Fragment key={open ? 'open' : 'closed'}>{children}</Fragment>
				</DialogContent>
			</Dialog>
		</>
	);
};
