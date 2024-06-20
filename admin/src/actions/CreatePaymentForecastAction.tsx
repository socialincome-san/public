import { Box, Button, CircularProgress, Modal, Tooltip, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DEFAULT_REGION } from '@socialincome/shared/src/firebase';
import { PaymentProcessTaskType } from '@socialincome/shared/src/types/payment';
import { calcFinalPaymentDate, toPaymentDate } from '@socialincome/shared/src/types/recipient';
import { downloadStringAsFile } from '@socialincome/shared/src/utils/html';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useSnackbarController } from 'firecms';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { PaymentForecastProps } from '../../../functions/src/webhooks/admin/payment-forecast';

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

export function CreatePaymentForecastAction() {
	const snackbarController = useSnackbarController();
	const [isOpen, setIsOpen] = useState(false);
	const [confirmCreateNewPayments, setConfirmCreateNewPayments] = useState(false);
	const [isFunctionRunning, setIsFunctionRunning] = useState(false);
	const [paymentDate, setPaymentDate] = useState<DateTime>(toPaymentDate(DateTime.local({ zone: 'utc' })));

	const createPaymentForecast = () => {
		const runPaymentForecastTask = httpsCallable<PaymentForecastProps, string>(
			getFunctions(undefined, DEFAULT_REGION),
			'runPaymentForecastTask',
		);
		setIsFunctionRunning(true);
		runPaymentForecastTask({
			timestamp: paymentDate.toSeconds(),
		})
			.then((result) => {
				console.log(result);
			})
			.catch((reason: Error) => {
				snackbarController.open({ type: 'error', message: reason.message });
			})
			.finally(() => setIsFunctionRunning(false));
	};

	return (
		<div>
			<Button onClick={createPaymentForecast} color="primary">
				Create Forecast
			</Button>
		</div>
	);
}
