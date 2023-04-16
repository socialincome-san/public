import { Box, Button, CircularProgress, Modal, Tooltip, Typography } from '@mui/material';
import { AdminPaymentProcessTask } from '@socialincome/shared/src/types';
import { downloadStringAsFile } from '@socialincome/shared/src/utils/html';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useSnackbarController } from 'firecms';
import { useState } from 'react';

const STYLE = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	p: 4,
};

export function PaymentProcessAction() {
	const snackbarController = useSnackbarController();
	const [isOpen, setIsOpen] = useState(false);
	const [confirmCreateNewPayments, setConfirmCreateNewPayments] = useState(false);
	const [isFunctionRunning, setIsFunctionRunning] = useState(false);

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		setIsOpen(false);
	};

	const triggerFirebaseFunction = (task: AdminPaymentProcessTask) => {
		const runAdminPaymentProcessTask = httpsCallable<AdminPaymentProcessTask, string>(
			getFunctions(),
			'runAdminPaymentProcessTask'
		);
		setIsFunctionRunning(true);
		runAdminPaymentProcessTask(task)
			.then((result) => {
				if (task === AdminPaymentProcessTask.GetRegistrationCSV || task === AdminPaymentProcessTask.GetPaymentCSV) {
					const fileName = `11866_${new Date().toLocaleDateString('sv')}.csv`; // 11866_YYYY-MM-DD.csv
					downloadStringAsFile(result.data, fileName);
				} else {
					snackbarController.open({ type: 'success', message: result.data });
				}
				setConfirmCreateNewPayments(false);
			})
			.catch(() => {
				snackbarController.open({ type: 'error', message: 'Oops, something went wrong.' });
			})
			.finally(() => setIsFunctionRunning(false));
	};

	return (
		<div>
			<Button onClick={handleOpen} color="primary">
				Payment Process
			</Button>
			<Modal open={isOpen} onClose={handleClose}>
				<Box sx={STYLE}>
					{isFunctionRunning ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
							<CircularProgress />
						</Box>
					) : (
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-around',
								gap: 2,
							}}
						>
							<Typography variant="h5" textAlign="center">
								Payment Process
							</Typography>
							<Button
								variant="outlined"
								onClick={() => triggerFirebaseFunction(AdminPaymentProcessTask.GetRegistrationCSV)}
							>
								Registration CSV
							</Button>
							<Button variant="outlined" onClick={() => triggerFirebaseFunction(AdminPaymentProcessTask.GetPaymentCSV)}>
								Payments CSV
							</Button>
							{!confirmCreateNewPayments && (
								<Tooltip title="This will create new payments for all active recipients for this month and the next months if the payments don't exist yet.">
									<Button variant="outlined" onClick={() => setConfirmCreateNewPayments(true)}>
										Create new payments
									</Button>
								</Tooltip>
							)}
							{confirmCreateNewPayments && (
								<Button
									variant="contained"
									onClick={() => triggerFirebaseFunction(AdminPaymentProcessTask.CreateNewPayments)}
								>
									Confirm
								</Button>
							)}
							<Button
								disabled={true}
								variant="outlined"
								onClick={() => triggerFirebaseFunction(AdminPaymentProcessTask.SendNotifications)}
							>
								Notify recipients (in development)
							</Button>{' '}
							<Button variant="outlined" color="error" onClick={handleClose}>
								Close
							</Button>
						</Box>
					)}
				</Box>
			</Modal>
		</div>
	);
}
