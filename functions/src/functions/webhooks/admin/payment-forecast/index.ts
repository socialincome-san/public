import { onCall } from 'firebase-functions/v2/https';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { PAYMENT_AMOUNT_SLE } from '../../../../../../shared/src/types/payment';
import { PAYMENT_FORECAST_FIRESTORE_PATH } from '../../../../../../shared/src/types/payment-forecast';
import {
	calcFinalPaymentDate,
	calcPaymentsLeft,
	RECIPIENT_FIRESTORE_PATH,
	RecipientProgramStatus,
} from '../../../../../../shared/src/types/recipient';
import { getLatestExchangeRate } from '../../../../../../shared/src/utils/exchangeRates';

function prepareNextSixMonths(): Map<string, number> {
	const nextSixMonths: Map<string, number> = new Map();
	const now: DateTime = DateTime.now();
	for (let i = 1; i < 7; ++i) {
		const nextMonthDateTime = now.plus({ months: i });
		nextSixMonths.set(nextMonthDateTime.toFormat('LLLL yyyy'), 0);
	}
	return nextSixMonths;
}

function addRecipient(nextSixMonths: Map<string, number>, paymentsLeft: number) {
	nextSixMonths.forEach((value, key) => {
		if (paymentsLeft > 0) {
			nextSixMonths.set(key, ++value);
			paymentsLeft -= 1;
		}
	});
}

async function calculateUSDAmount(firestoreAdmin: FirestoreAdmin): Promise<number> {
	const exchangeRateUSD = await getLatestExchangeRate(firestoreAdmin, 'USD');
	const exchangeRateSLE = await getLatestExchangeRate(firestoreAdmin, 'SLE');
	const monthlyAllowanceInUSD = (PAYMENT_AMOUNT_SLE / exchangeRateSLE) * exchangeRateUSD;
	return parseFloat(monthlyAllowanceInUSD.toFixed(2));
}

async function deleteAllDocuments(firestoreAdmin: FirestoreAdmin): Promise<void> {
	const batch = firestoreAdmin.firestore.batch();
	const snapshot = await firestoreAdmin.firestore.collection(PAYMENT_FORECAST_FIRESTORE_PATH).get();
	snapshot.forEach((doc) => {
		batch.delete(doc.ref);
	});
	await batch.commit();
}

async function fillNextSixMonths(
	firestoreAdmin: FirestoreAdmin,
	nextSixMonthsList: Map<string, number>,
): Promise<void> {
	const batch = firestoreAdmin.firestore.batch();
	const monthlyAllowanceInUSD = await calculateUSDAmount(firestoreAdmin);
	let count = 1;
	nextSixMonthsList.forEach((value, key) => {
		const newDocRef = firestoreAdmin.firestore.collection(PAYMENT_FORECAST_FIRESTORE_PATH).doc();
		batch.set(newDocRef, {
			order: count,
			month: key,
			numberOfRecipients: value,
			amount_usd: value * monthlyAllowanceInUSD,
			amount_sle: value * PAYMENT_AMOUNT_SLE,
		});
		++count;
	});
	await batch.commit();
}

export default onCall<undefined, Promise<string>>({ memory: '2GiB' }, async (request) => {
	const firestoreAdmin = new FirestoreAdmin();
	try {
		await firestoreAdmin.assertGlobalAdmin(request.auth?.token?.email);
		const nextSixMonthsList = prepareNextSixMonths();
		const recipientsSnapshot = await firestoreAdmin
			.collection(RECIPIENT_FIRESTORE_PATH)
			.where('progr_status', 'in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated])
			.get();
		recipientsSnapshot.docs.map((doc) => {
			const recipient = doc.data();
			if (recipient.si_start_date && recipient.progr_status === RecipientProgramStatus.Active) {
				addRecipient(
					nextSixMonthsList,
					calcPaymentsLeft(
						calcFinalPaymentDate(DateTime.fromSeconds(recipient.si_start_date._seconds, { zone: 'utc' })),
					),
				);
			} else if (recipient.progr_status === RecipientProgramStatus.Designated) {
				addRecipient(nextSixMonthsList, 6);
			}
		});

		await deleteAllDocuments(firestoreAdmin);
		await fillNextSixMonths(firestoreAdmin, nextSixMonthsList);

		return 'Function executed successfully.';
	} catch (error) {
		console.error('Error during function execution:', error);
		throw new Error('An error occurred while processing your request.');
	}
});
