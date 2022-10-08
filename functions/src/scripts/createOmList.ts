import admin from 'firebase-admin';
import { Firestore, QueryDocumentSnapshot } from 'firebase-admin/lib/firestore/index';

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://social-income-prod.firebaseio.com',
});

let db = admin.firestore();
let recCol = await db.collection('recipients').get();
let recipients = await recCol.docs;

async function createOmList(db: Firestore, recipients: QueryDocumentSnapshot[]) {
	recipients.map(async (doc) => {
		let pd = doc.data();
		let om = {
			om_user_type: 'subscriber',
			om_amount: 400,
			om_remarks: 'Social Income July 2022',
			first_name: pd['first_name'] || null,
			last_name: pd['last_name'] || null,
			om_uid: pd['om_uid'] || null,
			om_phone_number: null,
		};
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
			om['om_phone_number'] = phone;
		}
		await db.collection('om-list').doc(doc.id).set(om);
	});
}
await createOmList(db, recipients);
