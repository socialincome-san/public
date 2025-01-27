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
import { CreateDonationCertificatesProps } from '../../../functions/src/lib/donation-certificates';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	display: 'flex',
	flexDirection: 'column',
	gap: 2,
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
	const [modalOpen, setModalOpen] = React.useState(false);
	const [createAll, setCreateAll] = React.useState(false);

	if (!isGlobalAdmin) return null;

	const functions = getFunctions(undefined, DEFAULT_REGION);
	const createDonationCertificatesFunction = httpsCallable<CreateDonationCertificatesProps, string>(
		functions,
		'webhookCreateDonationCertificates',
	);

	const onClick = () => {
		const selectedEntities = selectionController?.selectedEntities.map((s) => s.id);
		if ((year && selectedEntities?.length > 0) || createAll) {
			createDonationCertificatesFunction({
				year: year,
				userIds: selectedEntities.length > 0 ? selectedEntities : undefined,
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
			<Button onClick={() => setModalOpen(true)} color="primary">
				Create Certificates
			</Button>
			<Modal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography sx={{ m: 1 }} variant="h5">
						Donation Certificates
					</Typography>
					<Typography sx={{ m: 1 }} variant="subtitle1">
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
								checked={createAll}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCreateAll(event.target.checked)}
								inputProps={{ 'aria-label': 'controlled' }}
							/>
						}
						label={<Typography variant="body2">Create certificate for all contributor in CH</Typography>}
					/>
					<Button onClick={onClick} color="primary">
						Generate Certificates
					</Button>
				</Box>
			</Modal>
		</div>
	);
}
