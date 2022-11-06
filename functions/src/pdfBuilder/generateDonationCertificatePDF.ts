import { connectStorageEmulator} from 'firebase/storage';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import * as config from '../config';

let STORAGE_EMULATOR_REQUIRED = true;

export const createAndUploadDonationCertificate = async (data: any, app:any, firestore: any) => {

	const storage = getStorage(app); 

	if (config.FB_STORAGE_EMULATOR_HOST && config.FB_STORAGE_EMULATOR_PORT && STORAGE_EMULATOR_REQUIRED) {
		if (STORAGE_EMULATOR_REQUIRED) {
			connectStorageEmulator(storage, config.FB_STORAGE_EMULATOR_HOST, +config.FB_STORAGE_EMULATOR_PORT);
			STORAGE_EMULATOR_REQUIRED = false;
		}
		console.log('Using storage emulator');
	} else {
		console.log('Using production storage');
	}

	const url = 'donation-certificates/' + data.entityId + '/' + data.year + "_" + data.address.country + "_" + data.currentDate + ".pdf";
	const fileRef = ref(storage, url);
	
	const translations = await translationStub();

	if (data.location === 'CH') {
		createDonationCertificateCH(fileRef, data, translations, firestore, storage);
	} else {
		//return await createDefaultDonationCertificate(fileRef, data, translations);
	}

}

export const createDonationCertificateCH = async (fileRef: any, data: any, translations: Map<string, string>, firestore: any, storage: any) => {

	let pdfData: ArrayBuffer = new ArrayBuffer(8);
	let buffers: any = [];

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

	docPdf.on('data', buffers.push.bind(buffers));
	docPdf.on('end', () => {
		pdfData = Buffer.concat(buffers);
		uploadFileAndCreateDocumentEntry(fileRef, pdfData, data, firestore, storage);
	});

	docPdf.end();	
}


export const addDocumentToUser = async(data: any, fileRef: any, firestore: any, storage: any) => {

	const downloadUrl = '[File Download](' +  await getDownloadURL(fileRef) + ')';
	const documentKey = data.year + "-" + data.address.country;
	console.log('URL: ' + downloadUrl);
	const donationCertificatesRef = doc(firestore, "users", data.entityId, 'donation-certificate', documentKey ); 

	const now = new Date();
	const dateString = now.toLocaleDateString('de-DE');

	await setDoc(donationCertificatesRef, {
		created: dateString,
		url: downloadUrl,
		country: data.address.country,
		year: data.year.toString()
	}, { merge: true });
}

export const uploadFileAndCreateDocumentEntry = async(fileRef: any, pdfData: ArrayBuffer, data: any, firestore: any, storage: any) => {
	uploadBytes(fileRef, pdfData).then((snapshot) => {
		addDocumentToUser(data, fileRef, firestore, storage);
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


export const createDefaultDonationCertificate = async () => {

}