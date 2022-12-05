import { ExtraActionsParams, useSnackbarController } from '@camberi/firecms';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { User } from '../../../shared/src/types';

import _ from 'lodash';
import React from 'react';

export function CreateDonationCertificatesAction({ selectionController }: ExtraActionsParams<User>) {
	const snackbarController = useSnackbarController();
	const [year, setYear] = React.useState<string>('');

	const onClick = () => {
		const selectedEntities = selectionController?.selectedEntities;
		if (year) {
			const functions = getFunctions();
			const createDonationCertificatesFunction = httpsCallable(functions, 'createDonationCertificates');
			createDonationCertificatesFunction({
				year: year,
				users: selectedEntities,
			})
				.then(() => {
					snackbarController.open({
						type: 'success',
						message: `Donation Certificates for ${selectedEntities.length} users created for the year ${year}`,
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
				message: `Please select a year to generate Donation Certificates.`,
			});
		}
	};

	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
				<InputLabel>Year</InputLabel>
				<Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
					{_.range(2020, 2030).map((year) => (
						<MenuItem key={year} value={year}>
							{year}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Button size="large" color="primary" onClick={onClick}>
				Donation Certificates
			</Button>
		</div>
	);
}
