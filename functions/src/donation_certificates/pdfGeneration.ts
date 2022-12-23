import { Timestamp } from 'firebase-admin/lib/firestore';
import { createWriteStream } from 'fs';
import { useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { Contribution, Entity, User } from '../../../shared/src/types';

export const calculateFinancials = async (userId: string, year: number) => {
	let contributions: Contribution[] = [];
	const firestore = useFirestore();
	await firestore
		.collection(`users/${userId}/contributions`)
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((element) => {
				contributions.push(element.data() as Contribution);
			});
		})
		.catch((error) => {
			console.log('Error getting documents: ', error);
		});

	let total_chf = 0;
	let total_usd = 0;
	let total_eur = 0;

	// TODO: use lodash to calculate financialData
	// const totalContributionsByCurrency = _(contributions)
	// 	.filter((contribution) => contribution.created?.toDate()?.getFullYear() === year)
	// 	.groupBy((contribution) => contribution.currency)
	// 	.mapValues((contributions) => _.sumBy(contributions, (contribution) => contribution.amount));

	for await (const contribution of contributions) {
		const timestamp = contribution.created as Timestamp;
		const contributionDate = new Date(timestamp.seconds * 1000);

		if (year === contributionDate.getFullYear()) {
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
		}
	}
	return {
		total_chf: total_chf,
		total_eur: total_eur,
		total_usd: total_usd,
	};
};

export const createDonationCertificateCH = (userEntity: Entity<User>, year: number, filePath: string) => {
	return new Promise<void>(async (resolve) => {
		let writeStream = createWriteStream(filePath);
		let user = userEntity.values;
		let translations = user.location === 'CH' ? GERMAN_TRANSLATIONS : FRENSH_TRANSLATIONS;
		const financials = await calculateFinancials(userEntity.id, year);
		const currentDateString = new Date().toLocaleDateString('de-DE');
		const PDFDocument = require('pdfkit');
		let docPdf = new PDFDocument();
		docPdf.image('../shared/assets/logos/logo_color@2x.png', 45, 20, { width: 180 });
		docPdf.fontSize(12).text(translations['donation-certificate.header'], 45, 20, {
			align: 'right',
		});
		docPdf.moveDown(3);
		docPdf
			.fontSize(12)
			.text(
				`${user.personal?.name} ${user.personal?.lastname}\n${user.address?.street}\n${user.address?.zip} ${user.address?.city}\n${user.address?.country}`
			);
		docPdf.moveDown();
		docPdf.fontSize(12).text(`Zürich, ${currentDateString}`);
		docPdf.moveDown(1.5);
		docPdf.fontSize(14).font('Helvetica-Bold').text(translations['donation-certificate.title']);
		docPdf.moveDown(0.25);
		docPdf
			.fontSize(13)
			.font('Helvetica')
			.text(translations['donation-certificate.fiscal-year'] + year);
		docPdf.moveDown();
		docPdf
			.fontSize(12)
			.text(
				translations['donation-certificate.confirmation-1'] +
					user.personal?.name +
					' ' +
					user.personal?.lastname +
					translations['donation-certificate.confirmation-2'] +
					user.address?.city +
					translations['donation-certificate.confirmation-3'] +
					year +
					translations['donation-certificate.confirmation-4']
			);
		docPdf.moveDown(0.5);
		if (financials.total_chf !== 0) {
			docPdf.fontSize(12).text(translations['donation-certificate.contributions-chf'] + financials.total_chf);
		}
		if (financials.total_eur !== 0) {
			docPdf.fontSize(12).text(translations['donation-certificate.contributions-eur'] + financials.total_eur);
		}
		if (financials.total_usd !== 0) {
			docPdf.fontSize(12).text(translations['donation-certificate.contributions-usd'] + financials.total_usd);
		}
		if (financials.total_chf === 0 && financials.total_eur === 0 && financials.total_usd === 0) {
			docPdf.fontSize(10).font('Helvetica-Oblique').text(translations['donation-certificate.no-contributions']);
		}
		docPdf.moveDown();
		docPdf
			.fontSize(12)
			.font('Helvetica')
			.text(
				translations['donation-certificate.time-period-1'] +
					year +
					translations['donation-certificate.time-period-2'] +
					year +
					translations['donation-certificate.time-period-3']
			);
		docPdf.moveDown();
		docPdf.fontSize(12).text(translations['donation-certificate.information-1']);
		docPdf.moveDown();
		docPdf.fontSize(12).text(translations['donation-certificate.information-2']);
		docPdf.moveDown(2);
		docPdf.fontSize(12).text(translations['donation-certificate.information-3']);
		docPdf.moveDown(2);
		let yPosition = docPdf.y;
		docPdf.image('../shared/assets/pdf/signature_sandino.png', 45, yPosition, { width: 200 });
		docPdf.image('../shared/assets/pdf/signature_kerrin.png', 280, yPosition, { width: 200 });
		docPdf.moveDown();
		yPosition = docPdf.y;
		docPdf.fontSize(10).text('Sandino Scheidegger', 45, yPosition);
		docPdf.fontSize(10).text('Kerrin Dieckmann', 280, yPosition);
		yPosition = docPdf.y;
		docPdf.fontSize(9).text(translations['donation-certificate.signature-1'], 45, yPosition);
		docPdf.fontSize(9).text(translations['donation-certificate.signature-2'], 280, yPosition);
		docPdf.text(translations['donation-certificate.footer-1'], 45, docPdf.page.height - 150);
		docPdf.text(translations['donation-certificate.footer-2'], 245, docPdf.page.height - 150);
		docPdf.text(translations['donation-certificate.footer-3'], 445, docPdf.page.height - 150);
		docPdf.pipe(writeStream);
		writeStream.on('finish', () => resolve());
		docPdf.end();
	});
};

interface TranslationStub {
	'donation-certificate.header': string;
	'donation-certificate.title': string;
	'donation-certificate.fiscal-year': string;
	'donation-certificate.salutation': string;
	'donation-certificate.confirmation-1': string;
	'donation-certificate.confirmation-2': string;
	'donation-certificate.confirmation-3': string;
	'donation-certificate.confirmation-4': string;
	'donation-certificate.time-period-1': string;
	'donation-certificate.time-period-2': string;
	'donation-certificate.time-period-3': string;
	'donation-certificate.contributions-chf': string;
	'donation-certificate.contributions-eur': string;
	'donation-certificate.contributions-usd': string;
	'donation-certificate.no-contributions': string;
	'donation-certificate.information-1': string;
	'donation-certificate.information-2': string;
	'donation-certificate.information-3': string;
	'donation-certificate.signature-1': string;
	'donation-certificate.signature-2': string;
	'donation-certificate.footer-1': string;
	'donation-certificate.footer-2': string;
	'donation-certificate.footer-3': string;
}

const GERMAN_TRANSLATIONS: TranslationStub = {
	'donation-certificate.header': 'Verein mit Steuerbefreiung\nKanton Zürich',
	'donation-certificate.title': 'Spendenbescheinigung',
	'donation-certificate.fiscal-year': 'Jahr ',
	'donation-certificate.salutation': 'Guten Tag ',
	'donation-certificate.confirmation-1': `Hiermit bestätigen wir gegenüber der Steuerbehörde, dass Social Income von `,
	'donation-certificate.confirmation-2': ': wohnhaft in ',
	'donation-certificate.confirmation-3': ': im Jahre ',
	'donation-certificate.confirmation-4': ' gesamthaft folgende Spendenzuwendung erhalten zu haben:',
	'donation-certificate.time-period-1': 'Berücksichtigt wurden sämtliche eingegangenen Spenden zwischen dem 01.01.',
	'donation-certificate.time-period-2': ' und dem 31.12.',
	'donation-certificate.time-period-3': '.',
	'donation-certificate.contributions-chf': 'Spenden in CHF: ',
	'donation-certificate.contributions-eur': 'Spenden in EUR: ',
	'donation-certificate.contributions-usd': 'Spenden in USD: ',
	'donation-certificate.no-contributions': 'Keine Spenden',
	'donation-certificate.information-1':
		'Bitte beachten Sie für einen möglichen Spendenabzug Ihrer Spende die kantonalen Regelungen in Ihrem Steuerkanton.',
	'donation-certificate.information-2': 'Vielen Dank für Ihre Unterstützung.',
	'donation-certificate.information-3': 'Freundliche Grüsse',
	'donation-certificate.signature-1': 'Geschäftsführer',
	'donation-certificate.signature-2': 'Leiterin Finanzen',
	'donation-certificate.footer-1': `Social Income\nZweierstrasse 103\n8003 Zürich\nhello@socialincome.org\nSchweiz`,
	'donation-certificate.footer-2': `Steuerbefreiter Verein\n\nIDE: UID-289.611.695\n\nDUNS: 48-045-6376`,
	'donation-certificate.footer-3': `Kontakt\n\n\n\nsocialincome.org`,
};

const FRENSH_TRANSLATIONS: TranslationStub = {
	'donation-certificate.header': 'Association à but non lucratif\nexonérée d’impôt par le\nCanton de Zurich',
	'donation-certificate.title': 'Attestation de dons pour',
	'donation-certificate.fiscal-year': 'année fiscale ',
	'donation-certificate.salutation': 'Bonjour,',
	'donation-certificate.confirmation-1': `Par la présente, nous attestons auprès des autorités fiscales que`,
	'donation-certificate.confirmation-2': ', domicilié à ',
	'donation-certificate.confirmation-3': ', a effectué en ',
	'donation-certificate.confirmation-4': ` des dons à l’association Social Income pour un montant total de :`,
	'donation-certificate.time-period-1': 'Tous les dons reçus entre le 01.01.',
	'donation-certificate.time-period-2': ' et le 31.12.',
	'donation-certificate.time-period-3': ' ont été pris en compte.',
	'donation-certificate.contributions-chf': 'Dons en CHF: ',
	'donation-certificate.contributions-eur': 'Dons en EUR: ',
	'donation-certificate.contributions-usd': 'Dons en USD: ',
	'donation-certificate.no-contributions': 'Pas de dons',
	'donation-certificate.information-1':
		'Pour bénéficier d’une éventuelle déduction fiscale, nous vous invitons à vous renseigner sur la réglementation fiscale de votre canton concernant les donations à une organisation d’utilité publique.',
	'donation-certificate.information-2': 'Nous vous remercions chaleureusement de votre soutien.',
	'donation-certificate.information-3': 'Bien cordialement',
	'donation-certificate.signature-1': 'Directeur général',
	'donation-certificate.signature-2': 'Trésorière',
	'donation-certificate.footer-1': `Social Income\nZweierstrasse 103\n8003 Zurich\nhello@socialincome.org\nSuisse`,
	'donation-certificate.footer-2': `Association à but non lucratif\n\nIDE: CHE-289.611.695\n\nDUNS: 48-045-6376`,
	'donation-certificate.footer-3': `Contact\n\n\nsocialincome.org`,
};

const ENGLISH_TRANSLATIONS: TranslationStub = {
	'donation-certificate.header': 'Association with tax exemption in the canton of Zurich',
	'donation-certificate.title': 'Donation receipt',
	'donation-certificate.fiscal-year': 'Fiscal year ',
	'donation-certificate.salutation': 'Dear ',
	'donation-certificate.confirmation-1': `We hereby confirm to the tax authorities that Social Income received from `,
	'donation-certificate.confirmation-2': ', residing in ',
	'donation-certificate.confirmation-3': ',  in the year  ',
	'donation-certificate.confirmation-4': ` the following donations:`,
	'donation-certificate.time-period-1': 'All donations received between 01.01.',
	'donation-certificate.time-period-2': ' and 31.12.',
	'donation-certificate.time-period-3': ' were taken into account.',
	'donation-certificate.contributions-chf': 'Donations in CHF: ',
	'donation-certificate.contributions-eur': 'Donations in EUR: ',
	'donation-certificate.contributions-usd': 'Donations in USD: ',
	'donation-certificate.no-contributions': 'No donations',
	'donation-certificate.information-1':
		'Please refer to the cantonal tax regulations for more information on how to deduct your donations.',
	'donation-certificate.information-2': 'Thank you for your support.',
	'donation-certificate.information-3': 'All the best,',
	'donation-certificate.signature-1': 'Director',
	'donation-certificate.signature-2': 'Head of Finance',
	'donation-certificate.footer-1': `Social Income\nZweierstrasse 103\n8003 Zurich\nhello@socialincome.org\nSwitzerland`,
	'donation-certificate.footer-2': `Association with tax exemption\n\nIDE: UID-289.611.695\n\nDUNS: 48-045-6376`,
	'donation-certificate.footer-3': `Contact\n\n\nsocialincome.org`,
};
