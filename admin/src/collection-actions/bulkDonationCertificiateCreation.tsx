import React from 'react';
import { Box, Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Modal, Select, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { ExtraActionsParams, useSnackbarController, useAuthController } from '@camberi/firecms';
import { getFunctions, httpsCallable } from 'firebase/functions';


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

export function BulkDonationCertificateAction({ selectionController }: ExtraActionsParams) {
	const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
	const [open, setOpen] = React.useState(false);
	const [checked, setChecked] = React.useState(false);
	const [numberOfEntities, setNumberOfEntities] = React.useState(Number);


	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const yearMenuItems = years.map((item) => (
		<MenuItem key={item} value={item}>
			{item}
		</MenuItem>
	));
	const [year, setYear] = React.useState<string>();

	const snackbarController = useSnackbarController();

	const onClick = (event: React.MouseEvent) => {
		const selectedEntities = selectionController?.selectedEntities;
		setNumberOfEntities(selectedEntities.length);
		console.log(selectedEntities);
		const count = selectedEntities ? selectedEntities.length : 0;

		if (year) {
			const functions = getFunctions();
			const bulkDonationCertificateBuilderFunction = httpsCallable(functions, 'bulkDonationCertificateBuilderFunction');

			const request = {
				mailFlag: checked,
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

	const setMailCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
	  };

	return (
		<div>
		<Button onClick={handleOpen} color="primary">
			Donation <br></br>
			Certificates
		</Button>
		<Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
		<Box sx={style}>
		<Typography sx={{m: 1}} variant="h5"> Donation Certificate Management</Typography>
		<Typography sx={{m: 1}} variant="subtitle1"> Please specify for which year the certifacte(s) ({numberOfEntities}) should be generated:</Typography>
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
			</FormControl><br/>
			<FormControlLabel sx={{m: 1}}control={
				<Checkbox sx={{paddingLeft: 0}}
						checked={checked}
						onChange={setMailCheckbox}
						inputProps={{ 'aria-label': 'controlled' }}/>
					}
				label={<Typography variant="body2">Send via Mail to Contributors</Typography>}
			/>
			<Button onClick={onClick} color="primary">
				Generate Donation Certificates
			</Button>
  		</Box>
      </Modal>
		</div>
	);
}
