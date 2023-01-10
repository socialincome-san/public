import { Timestamp } from 'firebase-admin/lib/firestore';
import { createWriteStream } from 'fs';
import PDFDocument from 'pdfkit';
import { collection } from '../../../shared/src/firebase/firestoreAdmin';
import { Contribution, Entity, User } from '../../../shared/src/types';
import { DonationCertificateLocales } from './locales';

export const calculateFinancials = async (userId: string, year: number) => {
	let contributions: Contribution[] = [];
	await collection<Contribution>(`users/${userId}/contributions`)
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((element) => {
				contributions.push(element.data());
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

		// TODO: we should directly filter in the query, not here
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

export const generateDonationCertificatePDF = (
	userEntity: Entity<User>,
	year: number,
	filePath: string,
	locales: DonationCertificateLocales
) => {
	return new Promise<void>(async (resolve) => {
		const writeStream = createWriteStream(filePath);
		const user = userEntity.values;
		const financials = await calculateFinancials(userEntity.id, year);
		const currentDateString = new Date().toLocaleDateString('de-DE', { dateStyle: 'medium' });
		let pdfDocument = new PDFDocument({ size: 'A4' });

		pdfDocument.registerFont('unica77', 'dist/assets/fonts/Unica77LLTT-Regular.ttf');
		pdfDocument.font('unica77').fontSize(12);
		pdfDocument.image('dist/assets/logos/logo_color@2x.png', 45, 20, { width: 180 });
		pdfDocument.fontSize(10).text(locales['header'], 45, 20, {
			align: 'right',
		});
		pdfDocument.moveDown(6);
		pdfDocument.text(
			`${user.personal?.name} ${user.personal?.lastname}\n${user.address?.street}\n${user.address?.zip} ${user.address?.city}\n${locales['country']}`
		);
		pdfDocument.moveDown(6);
		pdfDocument.text(`Zürich, ${currentDateString}`);
		pdfDocument.moveDown(1.5);
		pdfDocument.font('dist/assets/fonts/Unica77LLTT-Regular.ttf').text(locales['title'] + year);
		pdfDocument.moveDown(1.25);
		pdfDocument.text(
			locales['confirmation-1'] +
				user.personal?.name +
				' ' +
				user.personal?.lastname +
				locales['confirmation-2'] +
				user.address?.city +
				locales['confirmation-3'] +
				year +
				locales['confirmation-4']
		);
		pdfDocument.moveDown();
		if (financials.total_chf !== 0) {
			pdfDocument.text('– ' + locales['contributions-chf'] + financials.total_chf);
		}
		if (financials.total_eur !== 0) {
			pdfDocument.text('– ' + locales['contributions-eur'] + financials.total_eur);
		}
		if (financials.total_usd !== 0) {
			pdfDocument.text('– ' + locales['contributions-usd'] + financials.total_usd);
		}
		if (financials.total_chf === 0 && financials.total_eur === 0 && financials.total_usd === 0) {
			pdfDocument.text('– ' + locales['no-contributions']);
		}
		pdfDocument.moveDown(2);
		pdfDocument.text(locales['time-period-1'] + year + locales['time-period-2'] + year + locales['time-period-3']);
		pdfDocument.moveDown();
		pdfDocument.text(locales['information-1']);
		pdfDocument.moveDown();
		pdfDocument.text(locales['information-2']);
		pdfDocument.moveDown(2);
		pdfDocument.text(locales['information-3']);
		pdfDocument.moveDown(2);
		let yPosition = pdfDocument.y;
		pdfDocument.image('dist/assets/signatures/signature_kerrin.png', 45, yPosition, { width: 200 });
		pdfDocument.image('dist/assets/signatures/signature_sandino.png', 210, yPosition, { width: 200 });
		pdfDocument.moveDown();
		yPosition = pdfDocument.y;
		pdfDocument.text('Kerrin Dieckmann', 45, yPosition);
		pdfDocument.text('Sandino Scheidegger', 215, yPosition);
		yPosition = pdfDocument.y;
		pdfDocument.text(locales['signature-2'], 45, yPosition);
		pdfDocument.text(locales['signature-1'], 215, yPosition);
		pdfDocument
			.fontSize(10)
			.text(locales['footer-left-line-1'], 45, pdfDocument.page.height - 70, { lineBreak: false });
		pdfDocument.text(locales['footer-left-line-2'], 45, pdfDocument.page.height - 55, { lineBreak: false });
		pdfDocument.text(locales['footer-left-line-3'], 45, pdfDocument.page.height - 40, { lineBreak: false });
		pdfDocument.text(locales['footer-middle-line-1'], 215, pdfDocument.page.height - 70, { lineBreak: false });
		pdfDocument.text(locales['footer-middle-line-2'], 215, pdfDocument.page.height - 55, { lineBreak: false });
		pdfDocument.text(locales['footer-middle-line-3'], 215, pdfDocument.page.height - 40, { lineBreak: false });
		pdfDocument.text(locales['footer-right-line-1'], 405, pdfDocument.page.height - 70, { lineBreak: false });
		pdfDocument.text(locales['footer-right-line-2'], 405, pdfDocument.page.height - 55, { lineBreak: false });
		pdfDocument.text(locales['footer-right-line-3'], 405, pdfDocument.page.height - 40, { lineBreak: false });
		pdfDocument.pipe(writeStream);
		writeStream.on('finish', () => resolve());
		pdfDocument.end();
	});
};
