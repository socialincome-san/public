import admin from 'firebase-admin';
import { Firestore, QuerySnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase-admin/lib/firestore/index';
import { getMonthId } from './utils';

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://social-income-prod.firebaseio.com',
});

let db: Firestore = admin.firestore();
let recCol: QuerySnapshot<DocumentData> = await db.collection('recipients').get();
let recipients: QueryDocumentSnapshot[] = await recCol.docs;

let args = process.argv;
let askedDate = new Date();
if (args.length > 2) {
	askedDate = new Date(args[2]);
}
console.log(askedDate.toISOString());

let monthYear = askedDate.getFullYear();
let monthMonth = askedDate.getMonth();
let monthId = getMonthId(monthYear, monthMonth + 1);
console.log(monthId);

async function addPayments(db: Firestore, recipients: QueryDocumentSnapshot[]) {
	recipients.map(async (doc) => {
		let data = doc.data();
		if (data.test_recipient) {
			return;
		}
		let monthRef = await db.collection('recipients/' + doc.id + '/payments/').doc(monthId);
		let monthData = (await monthRef.get()).data();
		// if (monthData === undefined || monthData.status !== "confirmed") {
		//     console.log(monthData);
		//     console.log(data.om_uid);
		// }

		if (monthData && monthData.status === 'to_pay') {
			// if (monthData && monthData.status === "confirmed") {
			console.log(data.first_name + ' ' + data.last_name + ' ' + data.om_uid);
			console.log(monthData);
			console.log(`Marking payment paid for om_uid = ${data.om_uid}`);
			// console.log(`Marking payment confirmed for om_uid = ${data.om_uid}`);
			monthRef.set(
				{
					amount: 400,
					currency: 'SLE',
					status: 'open',
					payment_at: admin.firestore.Timestamp.fromDate(new Date(monthYear, monthMonth, 15)),
					// confirm_at: admin.firestore.Timestamp.fromDate(new Date(monthYear, monthMonth, 16)),
				},
				{ merge: true }
			);
		}
	});
}
await addPayments(db, recipients);
