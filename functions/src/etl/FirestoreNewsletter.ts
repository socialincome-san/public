import * as functions from 'firebase-functions';
import * as crypto from 'crypto';

import { Dictionary } from 'lodash';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import { MAILCHIMP_API_KEY, MAILCHIMP_SERVER, MAILCHIMP_LIST_ID } from '../config';

const client = require("@mailchimp/mailchimp_marketing");

export class FirestoreNewsletter {
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}

	addToMailchimp = async (dobject_old: Dictionary<String>, dobject: Dictionary<String>, fb_docid: String) : Promise<any> => {

		client.setConfig({
			apiKey: MAILCHIMP_API_KEY,
			server: MAILCHIMP_SERVER
		});

		try {
			/**
			 * if nothing has changed, skip
			 */
			if (dobject_old == dobject){
				console.log("nothings changed");
				return Promise.resolve("Successful");
			}

			/**
			 * if email has changed, archive old mc entry and create a new one
			 */
			if (dobject_old.email != dobject.email) {
				const subscriberHash = crypto
					.createHash("md5")
					.update(dobject_old.email.toLowerCase())
					.digest("hex");
	
				let response = client.lists.deleteListMember(
					MAILCHIMP_LIST_ID,
					subscriberHash,
				);
				await(response);
			}

			/**
			 * add or update list member
			 */
			let mc_data = {
				email_address: dobject.email,
				status: dobject.mc_status,
				merge_fields: {
					'FNAME': dobject.fname,
					'LNAME':  dobject.lname,
					'COUNTRY': dobject.country,
					'GENDER': dobject.gender,
					'CURRENCY': dobject.curency,
					'LANGUAGE': dobject.language,
					'SI_STATUS': dobject.si_status,
					'FB_UID': fb_docid
				}
			}
			let response = client.lists.setListMember(
				MAILCHIMP_LIST_ID,
				dobject.email,
				mc_data,
			);
			await(response);
			return Promise.resolve("Successful");
		} catch (error) {
			functions.logger.error(`Error upating subscribers-newsletter for: ${dobject.email}`, error);
			return Promise.resolve(undefined);
		}
	};

	registerTrigger = functions.firestore.document("newsletter-subscribers/{docId}")
		.onWrite(async (change, context) => {
			console.log('Syncing changes in newsletter-subscribers');
			let dobject_before = (change.before.data() as Dictionary<String>)!
			let dobject_after = (change.after.data() as Dictionary<String>)!
			await this.addToMailchimp(dobject_before, dobject_after, context.params.docId);
		});
}
