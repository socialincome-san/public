import * as functions from 'firebase-functions';
import { Contribution } from '../../../shared/src/types';
import { useFirestore } from '../../../shared/src/firebase/firestoreAdmin';

import { createAndUploadDonationCertificate } from './generateDonationCertificatePDF';
import { Timestamp } from 'firebase-admin/firestore';

export const bulkDonationCertificateBuilderFunction = functions.https.onCall(async (data, context) => {

	const now = new Date();
	const currentDate = now.toLocaleDateString('de-DE');
	const calculationYear: string = data.year;
	let numberOfPdfCreationSuccessful = 0;
 
	for await (const user of data.users ) {
		if( await createAndUploadDonationCertificate(await prepareData(user, calculationYear, currentDate))) {
			numberOfPdfCreationSuccessful += 1;
		}
	}

	const responseString: string = `Donation Certificates for ${numberOfPdfCreationSuccessful} of ${data.users.length} users executed for the year ${calculationYear}`;
	
	return responseString;

});

export const prepareData = async (data: any, calculationYear: string, currentDate: string) => {

	let contributions: any[] = [];
	const firestore = useFirestore();

	await firestore.collection("users/" + data.id + "/contributions")
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((element) => {
            contributions.push(element.data());
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });

	const pdfData = {
		entityId: data.id,
		year: calculationYear,
		location: data.values.location,
		currentDate: currentDate,
		address: data.values.address,
		personal: data.values.personal,
		financials: await calculateFinancials(contributions, calculationYear)
	}
	return pdfData;
}

export const calculateFinancials = async(contributions: Contribution[], year: string) => {
	let total_chf = 0;
	let total_usd = 0;
	let total_eur = 0;
	let lineItems:any[] = [];

	for await (const contribution of contributions ) {
		
		const timestamp = contribution.created as Timestamp;
		const date = new Date(timestamp.seconds * 1000);
		
		const contributionYear = date.getFullYear().toString();

		if (year === contributionYear.toString()) {
			switch (contribution.currency) {
				case 'chf':
					total_chf += contribution.amount;                              
					break;
				case 'usd':
					total_usd += contribution.amount;
					break;
				case 'eur':
					total_eur += contribution.amount;
					break;
			}
			const dateString = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear();
			const lineItem = dateString + ";" + contribution.amount + ";" + contribution.currency;
			lineItems.push(lineItem.toString());
		}

	}

	const financialData = {
		total_chf: total_chf,
		total_eur: total_eur,
		total_usd: total_usd,
		lineItems: lineItems
	};
	console.log(financialData);
	return financialData;
}