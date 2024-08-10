import { Box, Button, CircularProgress, Modal, Tooltip, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DEFAULT_REGION } from '@socialincome/shared/src/firebase';
import { PaymentProcessTaskType } from '@socialincome/shared/src/types/payment';
import { toPaymentDate } from '@socialincome/shared/src/types/recipient';
import { downloadStringAsFile } from '@socialincome/shared/src/utils/html';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useSnackbarController } from 'firecms';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { PaymentProcessProps } from '../../../functions/src/webhooks/admin/payment-process';

const BOX_STYLE = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	p: 4,
};

const createNewPaymentsDescription =
	'Update status of payments, create new payments for the upcoming month, and update status of recipients.';

export function PaymentProcessAction() {
	const snackbarController = useSnackbarController();
	const [isOpen, setIsOpen] = useState(false);
	const [confirmCreateNewPayments, setConfirmCreateNewPayments] = useState(false);
	const [isFunctionRunning, setIsFunctionRunning] = useState(false);
	const [paymentDate, setPaymentDate] = useState<DateTime>(toPaymentDate(DateTime.local({ zone: 'utc' })));

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => setIsOpen(false);

	const triggerFirebaseFunction = (task: PaymentProcessTaskType) => {
		const runPaymentProcessTask = httpsCallable<PaymentProcessProps, string>(
			getFunctions(undefined, DEFAULT_REGION),
			'runPaymentProcessTask',
		);
		setIsFunctionRunning(true);
		runPaymentProcessTask({
			type: task,
			timestamp: paymentDate.toSeconds(),
		})
			.then((result) => {
				if (task === PaymentProcessTaskType.GetRegistrationCSV || task === PaymentProcessTaskType.GetPaymentCSV) {
					const fileName = `11866_${paymentDate.toFormat('yyyy_MM_dd')}.csv`;
					downloadStringAsFile(result.data, fileName);
				} else {
					snackbarController.open({ type: 'success', message: result.data });
				}
				setConfirmCreateNewPayments(false);
			})
			.catch((reason: Error) => {
				snackbarController.open({ type: 'error', message: reason.message });
			})
			.finally(() => setIsFunctionRunning(false));
	};

	return (
		<div>
			<Button onClick={handleOpen} color="primary">
				Payment Process
			</Button>
			<Modal open={isOpen} onClose={handleClose}>
				<Box sx={BOX_STYLE}>
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
							<DatePicker
								label="Payment month"
								views={['month', 'year']}
								value={paymentDate.toJSDate() as any}
								onChange={(value) => {
									if (value) setPaymentDate(toPaymentDate(DateTime.fromJSDate(value)));
								}}
							/>
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
								<Tooltip title={createNewPaymentsDescription}>
									<Button variant="outlined" onClick={() => setConfirmCreateNewPayments(true)}>
										Update Database
									</Button>
								</Tooltip>
							)}
							{confirmCreateNewPayments && (
								<Button
									variant="contained"
									onClick={() => triggerFirebaseFunction(PaymentProcessTaskType.CreatePayments)}
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
