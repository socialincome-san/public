import React from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { ExtraActionsParams, useSnackbarController } from '@camberi/firecms';
import { getFunctions, httpsCallable } from 'firebase/functions';

export function BulkDonationCertificateAction({ selectionController }: ExtraActionsParams) {
	const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];

	const yearMenuItems = years.map((item) => (
		<MenuItem key={item} value={item}>
			{item}
		</MenuItem>
	));
	const [year, setYear] = React.useState<string>();

	const snackbarController = useSnackbarController();

	const onClick = (event: React.MouseEvent) => {
		const selectedEntities = selectionController?.selectedEntities;
		console.log(selectedEntities);
		const count = selectedEntities ? selectedEntities.length : 0;

		if (year) {
			const functions = getFunctions();
			const bulkDonationCertificateBuilderFunction = httpsCallable(functions, 'bulkDonationCertificateBuilderFunction');

			const request = {
				year: year,
				users: selectedEntities,
			};

			bulkDonationCertificateBuilderFunction(request)
				.then((res) => {
					console.log(res.data);
					snackbarController.open({
						type: 'success',
						message: `Donation Certificates for ${selectedEntities.length} users created for the year ${year}`,
					});
				})
				.catch((err) => {
					console.log(err);
					snackbarController.open({
						type: 'error',
						message: `An error occured during certificate creation.`,
					});
				});
		} else {
			snackbarController.open({
				type: 'error',
				message: `Please select a year to generate Donation Certificates.`,
			});
		}
	};

	const handleChange = (event: SelectChangeEvent) => {
		setYear(event.target.value as string);
	};

	return (
		<div>
			<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
				<InputLabel id="demo-select-small">Year</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={year}
					label="Year"
					onChange={handleChange}
				>
					{yearMenuItems}
				</Select>
			</FormControl>
			<br></br>
			<Button onClick={onClick} color="primary">
				Donation Certificates
			</Button>
		</div>
	);
}
