import { Button } from '@mui/material';
import { DEFAULT_REGION } from '@socialincome/shared/src/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useSnackbarController } from 'firecms';

export function CreatePaymentForecastAction() {
	const snackbarController = useSnackbarController();

	const createPaymentForecast = () => {
		const runPaymentForecastTask = httpsCallable(getFunctions(undefined, DEFAULT_REGION), 'webhookPaymentForecastTask');
		runPaymentForecastTask()
			.then((result) => {
				snackbarController.open({ type: 'success', message: 'Payment forecast updated successfully' });
			})
			.catch((reason: Error) => {
				snackbarController.open({ type: 'error', message: reason.message });
			});
	};

	return (
		<div>
			<Button onClick={() => createPaymentForecast()} color="primary">
				Refresh Forecast
			</Button>
		</div>
	);
}

function setIsFunctionRunning(arg0: boolean) {
	throw new Error('Function not implemented.');
}
