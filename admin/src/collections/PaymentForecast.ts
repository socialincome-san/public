import { buildProperties, useSnackbarController } from 'firecms';
import { PaymentForecastEntry, PAYMENT_FORECAST_FIRESTORE_PATH } from '@socialincome/shared/src/types/payment-forecast';
import { buildAuditedCollection } from './shared';
import { EntityCollection } from 'firecms/dist/types/collections';
import { CreatePaymentForecastAction } from '../actions/CreatePaymentForecastAction';
import { useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { toPaymentDate } from '@socialincome/shared/src/types/recipient';
import { PaymentForecastProps } from '../../../functions/src/webhooks/admin/payment-forecast';
import { DEFAULT_REGION } from '@socialincome/shared/src/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const buildPaymentForecastCollection = () => {

	const hasMounted = useRef(false);
	const snackbarController = useSnackbarController();
	const [, setIsFunctionRunning] = useState(false);
	const [paymentDate] = useState<DateTime>(toPaymentDate(DateTime.local({ zone: 'utc' })));
		

	useEffect(() => {
		if (!hasMounted.current) {
			hasMounted.current = true;			
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
				.finally(() => {
					setIsFunctionRunning(false)
				});
		} 
		
	  }, []);

	const collection: EntityCollection<PaymentForecastEntry> = {	
		name: 'Payout Forecast',
		group: 'Finances',
		path: PAYMENT_FORECAST_FIRESTORE_PATH,
		textSearchEnabled: false,
		initialSort: ['order', 'asc'],
		icon: 'LocalConvenienceStore',
		description: 'Projected payout forecast for the next six months',
		Actions: CreatePaymentForecastAction,
		permissions: {
			edit: false,
			create: false,
			delete: false,
		},
		properties: buildProperties<PaymentForecastEntry>({
			order: {
				dataType: 'number',
				name: 'Order',
				validation: { required: true }
			},
			month: {
				dataType: 'string',
				name: 'Month',
				validation: { required: true },
			},
			numberOfRecipients: {
				dataType: 'number',
				name: 'Number of Recipients',
				validation: { required: true },
			},
			amount_usd: {
				dataType: 'number',
				name: 'Total Amount USD',
				validation: { required: true },
			},
			amount_sle: {
				dataType: 'number',
				name: 'Total Amount SLE',
				validation: { required: true },
			},
		}),
	};
return buildAuditedCollection<PaymentForecastEntry>(collection);
}
