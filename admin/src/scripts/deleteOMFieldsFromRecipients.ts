import admin from "firebase-admin";
import { Firestore, QueryDocumentSnapshot } from "firebase-admin/lib/firestore/index";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://social-income-prod.firebaseio.com",
});

let db = admin.firestore();
let recCol = await db.collection("recipients").get();
let recipients = await recCol.docs;

async function deleteOMFieldsFromRecipients(db: Firestore, recipients: QueryDocumentSnapshot[]) {
  recipients.map(async (doc) => {
    let fields = ["om_phone_number", "om_amount", "om_remarks", "om_user_type"];
    await Promise.all(
      fields.map(async (f) => {
        doc.ref.update({ [f]: admin.firestore.FieldValue.delete() });
      })
    );
  });
}
await deleteOMFieldsFromRecipients(db, recipients);
