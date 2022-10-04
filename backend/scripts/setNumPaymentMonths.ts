import admin from 'firebase-admin';
import { Firestore, QueryDocumentSnapshot } from 'firebase-admin/lib/firestore/index';

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://social-income-prod.firebaseio.com',
});

let db = admin.firestore();
let recCol = await db.collection('recipients').get();
let recipients = await recCol.docs;

async function setNumPaymentMonths(db: Firestore, recipients: QueryDocumentSnapshot[]) {
	recipients.map(async (doc) => {
		let pd = doc.data();
		pd['num_payment_months'] = 36;
		await db.collection('recipients').doc(doc.id).set(pd);
	});
}
await setNumPaymentMonths(db, recipients);
