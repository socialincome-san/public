import { Button } from '@mui/material';
import { DEFAULT_REGION } from '@socialincome/shared/src/firebase';
import { toPaymentDate } from '@socialincome/shared/src/types/recipient';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useSnackbarController } from 'firecms';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { PaymentForecastProps } from '../../../functions/src/webhooks/admin/payment-forecast';

export function CreatePaymentForecastAction() {
	const createPaymentForecast = () => {
		const snackbarController = useSnackbarController();
		const [, setIsFunctionRunning] = useState(false);
		const [paymentDate] = useState<DateTime>(toPaymentDate(DateTime.local({ zone: 'utc' })));

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
				Refresh Forecast
			</Button>
		</div>
	);
}
function setIsFunctionRunning(arg0: boolean) {
	throw new Error('Function not implemented.');
}
