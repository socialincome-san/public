import admin from 'firebase-admin';
import { Firestore, QuerySnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase-admin/lib/firestore/index';
import * as fs from 'fs';
import * as csv from 'fast-csv';

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://social-income-prod.firebaseio.com',
});

let db: Firestore = admin.firestore();
let recCol: QuerySnapshot<DocumentData> = await db.collection('recipients').get();
let recipients: QueryDocumentSnapshot[] = await recCol.docs;

let data: { [key: string]: DocumentData } = {};

fs.createReadStream('social_income.csv', 'utf8')
	.pipe(csv.parse({ headers: true }))
	.on('data', (row) => (data[row.om_uid] = row))
	.on('end', (_rowCount: number) => syncRecipientGroundTruth(db, recipients, data));

async function syncRecipientGroundTruth(
	db: Firestore,
	recipients: QueryDocumentSnapshot[],
	data: { [key: string]: DocumentData }
) {
	let org_map: { [key: string]: string } = {
		'Aurora Foundation': 'aurora',
		'Equal Rights Alliance': 'equal_rights',
		'Jamil & Nyanga Jaward': 'jamil',
		'Reachout Salone': 'reachout',
		'Social Income': 'social_income',
	};
	recipients.map(async (doc) => {
		let pd = doc.data();
		if (pd.om_uid in data) {
			let d = data[pd.om_uid];
			console.log(`Found om_uid ${pd.om_uid}`);
			console.log(pd);
			await db
				.collection('recipients')
				.doc(doc.id)
				.set(
					{
						// first_name: d.first_name,
						// last_name: d.last_name,
						// num_payment_months: 36,
						// is_suspended: false,
						// email: d.email,
						im_uid: d.im_uid,
						im_link: d.im_link,
						communication_mobile_phone: {
							phone: parseInt(d.communication_mobile_phone),
							has_whatsapp: d.has_whatsapp === 'Yes',
						},
						mobile_money_phone: {
							phone: parseInt(d.mobile_money_phone),
						},
						speaks_english: pd.speaks_english !== undefined ? pd.speaks_english : d.speaks_english == 'Yes',
						profession: pd.profession ? pd.profession : d.profession,
						insta_handle: d.insta_handle,
						twitter_handle: d.twitter_handle,
						gender: pd.gender ? pd.gender : d.gender === 'M' ? 'male' : 'female',
						birth_date: pd.birth_date
							? pd.birth_date
							: d.birth_date && d.birth_date !== '-'
							? new Date(d.birth_date)
							: null,
						si_start_date: pd.si_start_date
							? pd.si_start_date
							: d.si_start_date && d.si_start_date !== '-'
							? new Date(d.si_start_date)
							: null,
					},
					{ merge: true }
				);
			if (d.recommended_by && d.recommended_by in org_map) {
				await db
					.collection('recipients')
					.doc(doc.id)
					.set(
						{
							organisation: db.doc('organisations/' + org_map[d.recommended_by]),
							recommended_by: org_map[d.recommended_by],
						},
						{ merge: true }
					);
			}
		} else {
			console.log(`Did not find data for om_uid ${pd.om_uid}. DB data is ${pd}`);
		}
	});
}
