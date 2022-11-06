import * as functions from 'firebase-functions';
//import { createAnduploadDonationCertificate } from './buildDonationCertificateCH';
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { createAndUploadDonationCertificate } from './generateDonationCertificatePDF';
import * as config from '../config';

let FIRESTORE_EMULATOR_REQUIRED = true;

export const bulkDonationCertificateBuilderFunction = functions.https.onCall(async (data, context) => {
	const app = await initializeFirebaseApp();
	const firestore = await initializeFirestore(app);
	const now = new Date();
	const currentDate = now.toLocaleDateString('de-DE');

	const calculationYear = data.year

	for (let i = 0; i < data.users.length; ++i) {
		await createAndUploadDonationCertificate(await prepareData(data.users[i], calculationYear, currentDate, firestore), app, firestore);
		//await addDocumentToUser(data.users[i], calculationYear, downloadUrl, firestore);
	};

	const responseString = `Donation Certificates for ${data.users.length} users created for the year ${calculationYear}`;
	
	return responseString;
	
});

export const initializeFirebaseApp = async () => {
	var firebaseConfig = {
		apiKey: '0',
		authDomain: 'demo-social-income.firebaseapp.com',
		projectId: 'demo-social-income-prod',
		storageBucket: 'demo-social-income.appspot.com',
		messagingSenderId: '0',
		appId: '0',
		measurementId: '0',
	};
	
	return initializeApp(firebaseConfig);
}


export const initializeFirestore = async (app: any) => {

	const firestore = getFirestore(app);

	if (config.FB_FIRESTORE_EMULATOR_HOST && config.FB_FIRESTORE_EMULATOR_PORT) {
		if (FIRESTORE_EMULATOR_REQUIRED) {
			connectFirestoreEmulator(firestore, config.FB_FIRESTORE_EMULATOR_HOST, +config.FB_FIRESTORE_EMULATOR_PORT);
			FIRESTORE_EMULATOR_REQUIRED = false;
		}
		console.log('Using firestore emulator');
	} else {
		console.log('Using production firestore');
	}

	return firestore;
}

export const prepareData = async (data: any, calculationYear: string, currentDate: string, firestore: any) => {


	const donationCertificateRef = collection(firestore,"users", data.id, "contributions");

	const querySnapshot = await getDocs(donationCertificateRef);

	let contributions: any[] = [];
	querySnapshot.forEach((element) => {
		contributions.push(element.data());
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

export const calculateFinancials = async(contributions: any[], year: string) => {
	let total_chf = 0;
	let total_usd = 0;
	let total_eur = 0;
	let lineItems:any[] = [];
	for (let j = 0; j < contributions.length; ++j) {
		const date = contributions[j].created.toDate();
		
		const contributionYear = date.getFullYear().toString();

		//console.log("Type of: " + typeof(contributionYear) + " Value: " + contributionYear);
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
	return financialData;
}


export const addDocumentToUser = async(data: any, calculationYear: string, downloadUrl: string, firestore: any) => {
	
	//const donationCertificatesRef = collection(firestore, "users", data.id, 'donation-certificate'); 
	const documentKey = calculationYear + "-" + data.values.address.country
	const donationCertificatesRef = doc(firestore, "users", data.id, 'donation-certificate', documentKey ); 

	const now = new Date();
	const dateString = now.toLocaleDateString('de-DE');

	await setDoc(donationCertificatesRef, {
		created: dateString,
		url: downloadUrl,
		country: data.values.address.country,
		year: calculationYear
	}, { merge: true });
}