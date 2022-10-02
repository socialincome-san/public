import admin from 'firebase-admin';

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://social-income-prod.firebaseio.com',
});

let db = admin.firestore();
let recCol = await db.collection('recipients').where('test_recipient', '==', true).get();
// let recCol = await db.collection("recipients").where("organisation", "==", "/organisations/test").get();
let recipients = await recCol.docs;
console.log(recipients[0].data());
