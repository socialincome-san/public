import { Box, Button, Modal, Typography } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { CollectionActionsProps, useAuthController, useSnackbarController } from 'firecms';
import React from 'react';
import { TwilioOutgoingMessageFunctionProps } from '../../../functions/src/webhooks/twilio/TwilioOutgoingMessageHandler';
import { Recipient } from '../../../shared/src/types/Recipient';

const STYLE = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	p: 4,
};

export function InviteWhatsappAction({ selectionController }: CollectionActionsProps<Recipient>) {
	const snackbarController = useSnackbarController();
	const isGlobalAdmin = useAuthController().extra?.isGlobalAdmin;

	const [open, setOpen] = React.useState(false);
	const [countSelectedEntities, setCountSelectedEntities] = React.useState(0);

	if (!isGlobalAdmin) return null;

	const handleOpen = () => {
		setOpen(true);
		setCountSelectedEntities(selectionController?.selectedEntities.length);
	};
	const handleClose = () => setOpen(false);

	const functions = getFunctions();
	const twilioOutgoingMessage = httpsCallable<TwilioOutgoingMessageFunctionProps, string>(
		functions,
		'twilioOutgoingMessage',
	);

	const onClick = () => {
		const selectedEntities = selectionController?.selectedEntities;
		if (selectedEntities?.length > 0) {
			twilioOutgoingMessage({
				recipients: selectedEntities,
				template: 'opt-in',
			})
				.then((result) => {
					snackbarController.open({
						type: 'success',
						message: result.data,
					});
				})
				.catch(() => {
					snackbarController.open({
						type: 'error',
						message: `An error occurred during opt-ins for Whatsapp.`,
					});
				});
		} else {
			snackbarController.open({
				type: 'error',
				message: `Please select a year and entries to generate Donation Certificates.`,
			});
		}
	};

	return (
		<div>
			<Button onClick={handleOpen} color="primary">
				Activate WhatsApp
			</Button>
			<Modal open={open} onClose={handleClose}>
				<Box sx={STYLE}>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-around',
							gap: 2,
						}}
					>
						<Typography variant="h5" textAlign="center">
							Send Whatsapp Invites
						</Typography>
						<Button variant="outlined" onClick={() => onClick()}>
							Invite {countSelectedEntities} recipients to Whatsapp
						</Button>
					</Box>
				</Box>
			</Modal>
		</div>
	);
}
