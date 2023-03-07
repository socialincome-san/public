import { useSnackbarController } from '@camberi/firecms';
import { Box, Button, Modal, Tooltip, Typography } from '@mui/material';
import { AdminPaymentProcessTask } from '@socialincome/shared/src/types';
import { downloadStringAsFile } from '@socialincome/shared/src/utils/html';
import { getFunctions, httpsCallable } from 'firebase/functions';
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

interface PaymentProcessModalProps {
	isOpen: boolean;
	handleClose: () => void;
}
export function PaymentProcessModal({ isOpen, handleClose }: PaymentProcessModalProps) {
	const snackbarController = useSnackbarController();
	const [confirmCreateNewPayments, setConfirmCreateNewPayments] = useState(false);

	const onClose = () => {
		setConfirmCreateNewPayments(false);
		handleClose();
	};

	const triggerFirebaseFunction = (task: AdminPaymentProcessTask) => {
		const runAdminPaymentProcessTask = httpsCallable<AdminPaymentProcessTask, string>(
			getFunctions(),
			'runAdminPaymentProcessTask'
		);
		runAdminPaymentProcessTask(task)
			.then((result) => {
				if (task === AdminPaymentProcessTask.GetRegistrationCSV || task === AdminPaymentProcessTask.GetPaymentCSV) {
					const fileName = `11866_${new Date().toLocaleDateString('sv')}.csv`; // 11866_YYYY-MM-DD.csv
					downloadStringAsFile(result.data, fileName);
				} else {
					snackbarController.open({ type: 'success', message: result.data });
					if (task === AdminPaymentProcessTask.CreateNewPayments) {
						setConfirmCreateNewPayments(false);
					}
				}
			})
			.catch(() => {
				snackbarController.open({ type: 'error', message: 'Oops, something went wrong.' });
			});
	};

	return (
		<Modal open={isOpen} onClose={onClose}>
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
						<Tooltip title="This will create new payments for all active recipients for this month if the payments don't exist yet.">
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
					<Button variant="outlined" onClick={() => triggerFirebaseFunction(AdminPaymentProcessTask.SendNotifications)}>
						Notify recipients
					</Button>
					<Button variant="outlined" color="error" onClick={onClose}>
						Close
					</Button>
				</Box>
			</Box>
		</Modal>
	);
}
