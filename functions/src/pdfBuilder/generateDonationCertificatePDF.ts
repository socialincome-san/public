import { connectStorageEmulator, getStorage, ref, uploadBytes } from "firebase/storage";
import { GetSignedUrlConfig } from '@google-cloud/storage';
import { initializeApp } from "firebase/app";
import { firestore, storage } from '../useFirestoreAdmin';
import { createWriteStream } from 'fs';
import { v4 } from 'uuid';
import * as config from '../config';
import * as admin from 'firebase-admin';


let STORAGE_EMULATOR_REQUIRED = true;

export const createAndUploadDonationCertificate = async (data: any) => {

	const url = 'donation-certificates/' + data.entityId + '/' + data.year + "_" + data.address.country + "_" + data.currentDate + "_" +  v4() +".pdf";
	
	const translations = await translationStub();
	console.log('data.location: ' + data.location)
	if (data.location === 'CH') {
		createDonationCertificateCH(url, data, translations);
	} else {
		
	}

}

export const initializeStorage = async() => {
	var firebaseConfig = {
		storageBucket: 'demo-social-income.appspot.com',
	};
	
	const app =  initializeApp(firebaseConfig);
	const storage = getStorage(app);

	if (config.FB_STORAGE_EMULATOR_HOST && config.FB_STORAGE_EMULATOR_PORT) {
		if (STORAGE_EMULATOR_REQUIRED) {
			connectStorageEmulator(storage, config.FB_STORAGE_EMULATOR_HOST, +config.FB_STORAGE_EMULATOR_PORT);
			STORAGE_EMULATOR_REQUIRED = false;
		}
		console.log('Using storage emulator');
	} else {
		console.log('Using production storage');
	}

	return storage;
}

export const createDonationCertificateCH = async (url: string, data: any, translations: Map<string, string>) => {
	const PDFDocument = require('pdfkit');
	let docPdf = new PDFDocument();

	//Address for contributor
	
	docPdf.fontSize(12).text(
		`${data.currentDate}`,
		100, 80);
	docPdf.moveDown();
	docPdf.fontSize(12).text(`Social Income\nZwierstrasse 103\n8004 Zürich\nSwitzerland`);

	//Address of social income
	docPdf.moveDown();
	docPdf.fontSize(12).text(
		`${data.personal.name} ${data.personal.lastname}\n${data.address.street}\n${data.address.zip} ${data.address.city}\n${data.address.country}`, {
	width: 410,
	align: 'right'
	}
	);

	docPdf.moveDown();
	docPdf.moveDown();
	docPdf.fontSize(14).text(translations.get('donation-certificate.title') + ' ');
	docPdf.moveDown();
	docPdf.fontSize(12).text(translations.get('donation-certificate.salutation') + `${data.personal.name} ${data.personal.lastname}`);
	docPdf.moveDown();
	docPdf.fontSize(12).text(
		translations.get('donation-certificate.confirmation-1')
		+ data.year
		+ translations.get('donation-certificate.confirmation-2')
	);

	if (!(data.financials.total_chf !== '0')) {
		docPdf.fontSize(12).text('Spenden CHF: ' + data.financials.total_chf);
	}
	if (!(data.financials.total_eur !== '0')) {
		docPdf.fontSize(12).text('Spenden EUR: ' + data.financials.total_chf);
	}	
	if (!(data.financials.total_chf !== '0')) {
		docPdf.fontSize(12).text('Spenden USD: ' + data.financials.total_chf);
	}

	docPdf.moveDown();
	docPdf.fontSize(12).text(translations.get('donation-certificate.information-1'));
	docPdf.moveDown();
	docPdf.fontSize(12).text(translations.get('donation-certificate.thanks'));
	docPdf.moveDown();
	docPdf.fontSize(12).text(translations.get('donation-certificate.greetings'));
	docPdf.moveDown();
	docPdf.moveDown();
	docPdf.moveDown();
	docPdf.moveDown();
	docPdf.fontSize(12).text(translations.get('donation-certificate.sender'));
	docPdf.moveDown();
	docPdf.moveDown();
	docPdf.addPage();
	docPdf.fontSize(12).text(translations.get('donation-certificate.single-donations'));
	docPdf.moveDown();
	const lineItems = data.financials.lineItems;
	for (let i = 0; i < lineItems.length; ++i) {
		const elements = lineItems[i].split(';');
		docPdf.fontSize(12).text(elements[0] + ': ' + elements[1] + " " + elements[2].toUpperCase());
	}

	const tempFileName = 'tempPdfFile.pdf';
	await docPdf.pipe(createWriteStream(tempFileName));
	docPdf.end();	
 
	const options = {
		destination: url
	}; 
	await storage.bucket().upload(tempFileName, options);

	console.log('Credentials: ' + admin.credential);

	const uploadedFile = storage.bucket().file(url);
	//const downloadUrl = uploadedFile.publicUrl();
	const signedUrlOptions: GetSignedUrlConfig = {
		version: 'v2',                            // default value
		action: 'read',                           // read | write | delete | resumable
		expires: Date.now() + 1000 * 60 * 60,     // expire date, one minute from now
	  };
	const downloadUrl = await uploadedFile.getSignedUrl(signedUrlOptions);
	console.log("SIGNED URL: " + downloadUrl);
	addDocumentToUser(data, downloadUrl);

}

export const uploadFileAndCreateDocumentEntry = async(url: string, pdfData: ArrayBuffer, data: any) => {

	const storage = await initializeStorage();
	const fileRef = ref(storage, url);

	uploadBytes(fileRef, pdfData).then((snapshot) => {
		addDocumentToUser(data, fileRef);
	});
}


export const addDocumentToUser = async(data: any, downloadUrl: any) => {

	const downloadUrlMarkDown = '[File Download](' +  downloadUrl + ')';
	const documentKey = data.year + "-" + data.address.country;
	console.log('URL: ' + downloadUrl);

	const now = new Date();
	const dateString = now.toLocaleDateString('de-DE');

	firestore.collection( "users/" + data.entityId + '/donation-certificate').doc(documentKey).set({
		created: dateString,
		url: downloadUrlMarkDown,
		country: data.address.country,
		year: data.year.toString()
	}, {merge: true})
	.then(() => {
		console.log("Document successfully written!");
	})
	.catch((error) => {
		console.error("Error writing document: ", error);
	});

}



export const translationStub = async () => {
	const translations = new Map();
	translations.set('donation-certificate.title','Spendenbescheinigung');
	translations.set('donation-certificate.salutation','Liebe/r ');
	translations.set('donation-certificate.confirmation-1',`Wir bestätigen hiermit, von Ihnen im Jahr `);
	translations.set('donation-certificate.confirmation-2',' Spenden in folgender Höhe erhalten zu haben (Details siehe Anhang):');
	translations.set('donation-certificate.information-1','Die Stiftung Social Income ist auf der Spendenliste des Kantons Zürich aufgeführt und somit in allen Kantonen als gemeinnnützige Organisation anerkannt.');
	translations.set('donation-certificate.thanks','Herzlichen Dank für Ihr Vertrauen und Engagement.');
	translations.set('donation-certificate.greetings','Freundliche Grüsse,');
	translations.set('donation-certificate.sender',`Sandino Scheidegger\nCEO / Founder\nss@socialincome.org`);
	translations.set('donation-certificate.single-donations', 'Liste Einzelspenden')
	return translations;

}