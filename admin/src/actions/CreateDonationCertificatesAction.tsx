import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Modal,
	Select,
	Typography,
} from '@mui/material';
import { DEFAULT_REGION } from '@socialincome/shared/src/firebase';
import { User } from '@socialincome/shared/src/types/user';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { CollectionActionsProps, useAuthController, useSnackbarController } from 'firecms';
import _ from 'lodash';
import React from 'react';
import { CreateDonationCertificatesFunctionProps } from '../../../functions/src/webhooks/admin/donation-certificates/DonationCertificateHandler';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	height: 400,
	bgcolor: 'background.paper',
	boxShadow: 24,
	p: 4,
};

export function CreateDonationCertificatesAction({ selectionController }: CollectionActionsProps<User>) {
	const snackbarController = useSnackbarController();
	const isGlobalAdmin = useAuthController().extra?.isGlobalAdmin;

	const [year, setYear] = React.useState<number>(new Date().getFullYear());
	const [open, setOpen] = React.useState(false);
	const [checked, setChecked] = React.useState(false);

	if (!isGlobalAdmin) return null;

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const functions = getFunctions(undefined, DEFAULT_REGION);
	const createDonationCertificatesFunction = httpsCallable<CreateDonationCertificatesFunctionProps, string>(
		functions,
		'createDonationCertificates',
	);

	const setMailCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
	};

	const onClick = () => {
		const selectedEntities = selectionController?.selectedEntities;
		if (year && selectedEntities?.length > 0) {
			createDonationCertificatesFunction({
				year: year,
				users: selectedEntities,
				sendEmails: checked,
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
						message: `An error occurred during certificate creation.`,
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
				Create Certificates
			</Button>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography sx={{ m: 1 }} variant="h5">
						{' '}
						Donation Certificates
					</Typography>
					<Typography sx={{ m: 1 }} variant="subtitle1">
						{' '}
						Specify for which year the certificate(s) should be generated:
					</Typography>
					<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
						<InputLabel id="demo-select-small">Year</InputLabel>
						<Select value={year} label="Year" onChange={(e) => setYear(parseInt(e.target.value as string))}>
							{_.range(2020, 2030).map((year) => (
								<MenuItem key={year} value={year}>
									{year}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControlLabel
						sx={{ m: 1 }}
						control={
							<Checkbox
								sx={{ paddingLeft: 0 }}
								checked={checked}
								onChange={setMailCheckbox}
								inputProps={{ 'aria-label': 'controlled' }}
							/>
						}
						label={<Typography variant="body2">Email certificates to selected contributors</Typography>}
					/>
					<Button onClick={onClick} color="primary">
						Generate Certificates
					</Button>
				</Box>
			</Modal>
		</div>
	);
}
