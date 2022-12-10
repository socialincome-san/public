import { ExtraActionsParams, useSnackbarController } from '@camberi/firecms';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { User } from '../../../shared/src/types';

import { getFunctions, httpsCallable } from 'firebase/functions';
import _ from 'lodash';
import React from 'react';
import { DonationCertificatesFunctionProps } from '../../../functions/src/donation_certificates/createDonationCertificatesFunction';

export function CreateDonationCertificatesAction({ selectionController }: ExtraActionsParams<User>) {
	const snackbarController = useSnackbarController();
	const [year, setYear] = React.useState<number>(new Date().getFullYear());

	const functions = getFunctions();
	const createDonationCertificatesFunction = httpsCallable<DonationCertificatesFunctionProps, string>(
		functions,
		'createDonationCertificates'
	);

	const onClick = () => {
		const selectedEntities = selectionController?.selectedEntities;
		if (year && selectedEntities?.length > 0) {
			createDonationCertificatesFunction({
				year: year,
				users: selectedEntities,
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
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
				<InputLabel>Year</InputLabel>
				<Select value={year} label="Year" onChange={(e) => setYear(parseInt(e.target.value as string))}>
					{_.range(2020, 2030).map((year) => (
						<MenuItem key={year} value={year}>
							{year}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Button size="large" color="primary" onClick={onClick}>
				Create Donation Certificates
			</Button>
		</div>
	);
}
