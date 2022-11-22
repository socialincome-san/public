import * as functions from 'firebase-functions';
import { Contribution } from '../../../shared/types';
import { firestore } from '../useFirestoreAdmin';
import { createAndUploadDonationCertificate } from './generateDonationCertificatePDF';

export const bulkDonationCertificateBuilderFunction = functions.https.onCall(async (data, context) => {

	const now = new Date();
	const currentDate = now.toLocaleDateString('de-DE');
	const calculationYear: string = data.year;
 
	for await (const user of data.users ) {
		await createAndUploadDonationCertificate(await prepareData(user, calculationYear, currentDate));
	}

	const responseString: string = `Donation Certificates for ${data.users.length} users created for the year ${calculationYear}`;
	
	return responseString;

});

export const prepareData = async (data: any, calculationYear: string, currentDate: string) => {

	let contributions: any[] = [];
	firestore.collection("users/" + data.id + "/contributions")
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
	for (let j = 0; j < contributions.length; ++j) {
		const date = contributions[j].created;
		
		const contributionYear = date.getFullYear().toString();

		if (year === contributionYear.toString()) {
			switch (contributions[j].currency) {
				case 'chf':
					total_chf += contributions[j].amount;                              
					break;
				case 'usd':
					total_usd += contributions[j].amount;
					break;
				case 'eur':
					total_eur += contributions[j].amount;
					break;
			}
			const dateString = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear();
			const lineItem = dateString + ";" + contributions[j].amount + ";" + contributions[j].currency;
			lineItems.push(lineItem.toString());
		}
	}
	const financialData = {
		total_chf: total_chf,
		total_eur: total_eur,
		total_usd: total_usd,
		lineItems: lineItems
	};
	console.log('financials: ');
	console.log(financialData);
	return financialData;
}