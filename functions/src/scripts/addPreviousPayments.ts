import admin from 'firebase-admin';
import { Firestore, QueryDocumentSnapshot } from 'firebase-admin/lib/firestore/index';
import { getMonthId, getValidMonths } from 'shared/utils';

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://social-income-prod.firebaseio.com',
});

let db = admin.firestore();
let recCol = await db.collection('recipients').get();
let recipients = await recCol.docs;

let args = process.argv;
let askedDate = new Date();
if (args.length > 2) {
	askedDate = new Date(args[2]);
}
console.log(askedDate.toISOString());

async function addPayments(db: Firestore, recipients: QueryDocumentSnapshot[]) {
	recipients.map(async (doc) => {
		let p = await db.collection('recipients/' + doc.id + '/payments').get();
		await p.docs;
		let pd = doc.data();

		console.log(doc.id + ' ' + pd.first_name + ' ' + pd.last_name);
		let startDate = pd.si_start_date.toDate();
		console.log(startDate);

		let months = getValidMonths(askedDate, new Date(pd.si_start_date.seconds * 1000), pd.num_payment_months);
		// console.log(months);
		// For each month, check if we need to create it
		months.map(async (month) => {
			let monthId = getMonthId(month[0], month[1]);
			console.log(monthId);
			let monthRef = await db.collection('recipients/' + doc.id + '/payments').doc(monthId);
			let monthData = (await monthRef.get()).data();
			// console.log(monthData);
			if (monthData === undefined) {
				let data = {
					amount: 300000,
					currency: 'SLL',
					status: 'confirmed',
					payment_at: admin.firestore.Timestamp.fromDate(new Date(month[0], month[1] - 1, 15)),
					confirm_at: admin.firestore.Timestamp.fromDate(new Date(month[0], month[1] - 1, 16)),
				};
				console.log(data);
				await monthRef.set(data);
			}
		});
	});
}
await addPayments(db, recipients);
