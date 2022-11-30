import { useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { uploadAndGetDownloadURL, useStorage } from '../../../shared/src/firebase/storageAdmin';
import { createWriteStream } from 'fs';

export const createAndUploadDonationCertificate = async (data: any) => {
	
	const translations = await translationStubGerman();
	if (data.location === 'CH') {
		createDonationCertificateCH(data, translations);
		return true
	} else {
		return false;
	}
};

}

export const createDonationCertificateCH = async (data: any, translations: Map<string, string>) => {
	const PDFDocument = require('pdfkit');
	let docPdf = new PDFDocument();
	docPdf.image('../shared/assets/logos/logo_color@2x.png', 45, 20, {width: 180});
	docPdf.fontSize(12).text(translations.get('donation-certificate.header'), 45, 20, {
		align: 'right'
	});
	docPdf.moveDown(3);
	docPdf.fontSize(12).text(
		`${data.personal.name} ${data.personal.lastname}\n${data.address.street}\n${data.address.zip} ${data.address.city}\n${data.address.country}`,
	);
	docPdf.moveDown();
	docPdf.fontSize(12).text(`Zürich, ${data.currentDate}`);
	docPdf.moveDown(1.5);
	docPdf.fontSize(14).font('Helvetica-Bold').text(translations.get('donation-certificate.title'));
	docPdf.moveDown(0.25)
	docPdf.fontSize(13).font('Helvetica').text(translations.get('donation-certificate.fiscal-year') + data.year);
	docPdf.moveDown();
	docPdf.fontSize(12).text(translations.get('donation-certificate.confirmation-1') + data.personal.name + " " + data.personal.lastname
		 + translations.get('donation-certificate.confirmation-2') + data.address.city
		 + translations.get('donation-certificate.confirmation-3') + data.year 
		 + translations.get('donation-certificate.confirmation-4'));
	docPdf.moveDown(0.5);
	if ((data.financials.total_chf !== 0)) {
		docPdf.fontSize(12).text(translations.get('donation-certificate.contributions-chf') + data.financials.total_chf);
	}
	if ((data.financials.total_eur !== 0)) {
		docPdf.fontSize(12).text(translations.get('donation-certificate.contributions-eur') + data.financials.total_eur);
	}	
	if ((data.financials.total_usd !== 0)) {
		docPdf.fontSize(12).text(translations.get('donation-certificate.contributions-usd') + data.financials.total_usd);
	}
	if (data.financials.total_chf === 0 && data.financials.total_eur === 0 && data.financials.total_usd === 0) {
		docPdf.fontSize(10).font('Helvetica-Oblique').text(translations.get('donation-certificate.no-contributions'));
	}
	docPdf.moveDown();
	docPdf.fontSize(12).font('Helvetica').text(translations.get('donation-certificate.time-period-1')
		+ data.year + translations.get('donation-certificate.time-period-2')
		+ data.year + translations.get('donation-certificate.time-period-3'));
	docPdf.moveDown();
	docPdf.fontSize(12).text(translations.get('donation-certificate.information-1'));
	docPdf.moveDown();
	docPdf.fontSize(12).text(translations.get('donation-certificate.information-2'));
	docPdf.moveDown(2);
	docPdf.fontSize(12).text(translations.get('donation-certificate.information-3'));
	docPdf.moveDown(2);
	let yPosition = docPdf.y;
	docPdf.image('../shared/assets/pdf/signature_sandino.png', 45, yPosition, {width: 200});
	docPdf.image('../shared/assets/pdf/signature_kerrin.png', 280, yPosition, {width: 200});
	docPdf.moveDown();
	yPosition = docPdf.y;
	docPdf.fontSize(10).text('Sandino Scheidegger', 45, yPosition);
	docPdf.fontSize(10).text('Kerrin Dieckmann', 280, yPosition);
	yPosition = docPdf.y;
	docPdf.fontSize(9).text(translations.get('donation-certificate.signature-1'), 45, yPosition);
	docPdf.fontSize(9).text(translations.get('donation-certificate.signature-2'), 280, yPosition);

	docPdf.text(translations.get('donation-certificate.footer-1'), 45, docPdf.page.height - 150);
	docPdf.text(translations.get('donation-certificate.footer-2'), 245, docPdf.page.height - 150);
	docPdf.text(translations.get('donation-certificate.footer-3'), 445, docPdf.page.height - 150);



	const tempFileName = 'tempPdfFile.pdf';

	const outputFile = createWriteStream(tempFileName)

	docPdf.pipe(outputFile);

	outputFile.on('finish', async () => {
		const path = 'donation-certificates/' + data.entityId + '/' + data.year + "_" + data.address.country + "_" + data.currentDate +".pdf";
		const downloadObject = await uploadAndGetDownloadURL(useStorage().bucket(), tempFileName, path);
		console.log(downloadObject.downloadUrl);
		addDocumentToUser(data, downloadObject.downloadUrl);
	});
	docPdf.end();
}

export const addDocumentToUser = async(data: any, downloadUrl: any) => {

	const downloadUrlMarkDown = '[File Download](' +  downloadUrl + ')';
	const documentKey = data.year + "-" + data.address.country;

	const firestore = useFirestore();

	firestore.collection( "users/" + data.entityId + '/donation-certificate').doc(documentKey).set({
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



export const translationStubGerman = async () => {
	const translations = new Map();
	translations.set('donation-certificate.header', 'Verein mit Steuerbefreiung\nKanton Zürich');
	translations.set('donation-certificate.title','Spendenbescheinigung');
	translations.set('donation-certificate.fiscal-year', 'Jahr ');
	translations.set('donation-certificate.salutation','Liebe/r ');
	translations.set('donation-certificate.confirmation-1',`Hiermit bestätigen wir gegenüber der kantonalen Steuerbehörde, dass Social Income von `);
	translations.set('donation-certificate.confirmation-2',', wohnhaft in ');
	translations.set('donation-certificate.confirmation-3',', im Jahre ');
	translations.set('donation-certificate.confirmation-4',' gesamthaft folgende Spendenzuwendung erhalten zu haben:');
	translations.set('donation-certificate.time-period-1','Berücksichtigt wurden sämtliche eingegangenen Spenden zwischen dem 01.01.');
	translations.set('donation-certificate.time-period-2',' und dem 31.12.');
	translations.set('donation-certificate.time-period-3','.');
	translations.set('donation-certificate.contributions-chf', 'Spenden CHF: ');
	translations.set('donation-certificate.contributions-eur', 'Spenden EUR: ');
	translations.set('donation-certificate.contributions-usd', 'Spenden USD: ');
	translations.set('donation-certificate.no-contributions', 'Keine Spenden gefunden');
	translations.set('donation-certificate.information-1','Bitte beachten Sie für einen möglichen Spendenabzug Ihrer Spende an gemeinnützige Organisationen die kantonalen Regelungen in Ihrem Steuerkanton.');
	translations.set('donation-certificate.information-2','Vielen Dank für Ihre Unterstützung');
	translations.set('donation-certificate.information-3','Freundliche Grüsse');
	translations.set('donation-certificate.signature-1','Geschäftsleitung und Vorstandsmitglied');
	translations.set('donation-certificate.signature-2','Finanzen');
	translations.set('donation-certificate.footer-1',`Social Income\nZwierstrasse 103\n8003 Zurich\ncontributors@socialincome.org\nSwitzerland`);
	translations.set('donation-certificate.footer-2',`Steuerbefreiter Verein\n\nIDE: CHE-289.611.695\n\nDUNS: 48-045-6376`);
	translations.set('donation-certificate.footer-3',`Kontakt\n\n\n\nwww.socialincome.org`);
	return translations;

}


export const translationStubFrench = async () => {
	const translations = new Map();
	translations.set('donation-certificate.header', 'Association à but non lucratif\nexonérée d’impôt par le\nCanton de Zurich');
	translations.set('donation-certificate.title','Attestation de dons');
	translations.set('donation-certificate.fiscal-year', 'Année fiscale ');
	translations.set('donation-certificate.salutation','Liebe/r ');
	translations.set('donation-certificate.confirmation-1',`Nous attestons auprès des autorités fiscales que l’association Social Income a reçu des dons de la part de`);
	translations.set('donation-certificate.confirmation-2',', domicilié à ');
	translations.set('donation-certificate.confirmation-3',', au cours de l’année ');
	translations.set('donation-certificate.confirmation-4',` des dons d'un montant total de :`);
	translations.set('donation-certificate.time-period-1','Tous les dons reçus entre le 01.01.');
	translations.set('donation-certificate.time-period-2',' et le 31.12.');
	translations.set('donation-certificate.time-period-3',' ont été pris en compte.');
	translations.set('donation-certificate.contributions-chf', 'Dons CHF: ');
	translations.set('donation-certificate.contributions-eur', 'Dons EUR: ');
	translations.set('donation-certificate.contributions-usd', 'Dons USD: ');
	translations.set('donation-certificate.no-contributions', 'Pas de dons reçus');
	translations.set('donation-certificate.information-1','Pour une déduction d’impôt, veuillez-vous renseigner sur la réglementation fiscale pour donation à une organisation caritative mise en place au sein de votre canton.');
	translations.set('donation-certificate.information-2','Nous vous remercions chaleureusement de votre soutien.');
	translations.set('donation-certificate.information-3','Bien cordialement');
	translations.set('donation-certificate.signature-1','Geschäftsleitung und Vorstandsmitglied');
	translations.set('donation-certificate.signature-2','Finanzen');
	translations.set('donation-certificate.footer-1',`Social Income\nZwierstrasse 103\n8003 Zurich\ncontributors@socialincome.org\nSwitzerland`);
	translations.set('donation-certificate.footer-2',`Association à but non lucratif\n\nIDE: CHE-289.611.695\n\nDUNS: 48-045-6376`);
	translations.set('donation-certificate.footer-3',`Contact\n\n\nwww.socialincome.org`);
	return translations;
};
