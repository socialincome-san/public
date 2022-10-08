import admin from 'firebase-admin';
import { Firestore, QueryDocumentSnapshot } from 'firebase-admin/lib/firestore/index';

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://social-income-prod.firebaseio.com',
});

let db = admin.firestore();
let recCol = await db.collection('recipients').get();
let recipients = await recCol.docs;

async function updateOMPhoneNumber(db: Firestore, recipients: QueryDocumentSnapshot[]) {
	recipients.map(async (doc) => {
		let pd = doc.data();
		// console.log(pd["first_name"] + " " + pd["last_name"] + " " + pd["mobile_money_phone"]["phone"] + " " + pd["om_phone_number"]);
		if (pd['mobile_money_phone'] && pd['mobile_money_phone']['phone']) {
			const sl_phone_start = 23200000000;
			const sl_phone_end = 23300000000;
			let phone = pd['mobile_money_phone']['phone'];
			if (phone >= sl_phone_start && phone <= sl_phone_end) {
				phone = phone % sl_phone_start;
			}
			console.log(
				pd['first_name'] +
					' ' +
					pd['last_name'] +
					' ' +
					pd['mobile_money_phone']['phone'] +
					' ' +
					pd['om_phone_number'] +
					' ' +
					phone
			);
			pd['om_phone_number'] = phone;
		}
		pd['om_user_type'] = 'subscriber';
		pd['om_amount'] = 400;
		pd['om_remarks'] = 'Social Income July 2022';
		await db.collection('recipients').doc(doc.id).set(pd);
	});
}
await updateOMPhoneNumber(db, recipients);
