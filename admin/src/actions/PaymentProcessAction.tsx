import { Box, Button, CircularProgress, Modal, Tooltip, Typography } from '@mui/material';
import { PaymentProcessTaskType } from '@socialincome/shared/src/types';
import { downloadStringAsFile } from '@socialincome/shared/src/utils/html';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useSnackbarController } from 'firecms';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { PaymentProcessTaskProps } from '../../../functions/src/webhooks/admin/payment-process/PaymentTaskProcessor';

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

	const triggerFirebaseFunction = (task: PaymentProcessTaskType) => {
		const runAdminPaymentProcessTask = httpsCallable<PaymentProcessTaskProps, string>(
			getFunctions(),
			'runAdminPaymentProcessTask'
		);
		setIsFunctionRunning(true);
		runAdminPaymentProcessTask({
			type: task,
			timestamp: DateTime.now().toSeconds(),
		})
			.then((result) => {
				if (task === PaymentProcessTaskType.GetRegistrationCSV || task === PaymentProcessTaskType.GetPaymentCSV) {
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
								onClick={() => triggerFirebaseFunction(PaymentProcessTaskType.GetRegistrationCSV)}
							>
								Registration CSV
							</Button>
							<Button variant="outlined" onClick={() => triggerFirebaseFunction(PaymentProcessTaskType.GetPaymentCSV)}>
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
									onClick={() => triggerFirebaseFunction(PaymentProcessTaskType.CreateNewPayments)}
								>
									Confirm
								</Button>
							)}
							<Button
								disabled={true}
								variant="outlined"
								onClick={() => triggerFirebaseFunction(PaymentProcessTaskType.SendNotifications)}
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
