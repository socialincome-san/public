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
		const currentDateString = new Date().toLocaleDateString('de-DE');
		let pdfDocument = new PDFDocument();

		pdfDocument.image('dist/assets/logos/logo_color@2x.png', 45, 20, { width: 180 });
		pdfDocument.fontSize(12).text(locales['header'], 45, 20, {
			align: 'right',
		});
		pdfDocument.moveDown(3);
		pdfDocument
			.fontSize(12)
			.text(
				`${user.personal?.name} ${user.personal?.lastname}\n${user.address?.street}\n${user.address?.zip} ${user.address?.city}\n${user.address?.country}`
			);
		pdfDocument.moveDown();
		pdfDocument.fontSize(12).text(`Zürich, ${currentDateString}`);
		pdfDocument.moveDown(1.5);
		pdfDocument.fontSize(14).font('Helvetica-Bold').text(locales['title']);
		pdfDocument.moveDown(0.25);
		pdfDocument
			.fontSize(13)
			.font('Helvetica')
			.text(locales['fiscal-year'] + year);
		pdfDocument.moveDown();
		pdfDocument
			.fontSize(12)
			.text(
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
		pdfDocument.moveDown(0.5);
		if (financials.total_chf !== 0) {
			pdfDocument.fontSize(12).text(locales['contributions-chf'] + financials.total_chf);
		}
		if (financials.total_eur !== 0) {
			pdfDocument.fontSize(12).text(locales['contributions-eur'] + financials.total_eur);
		}
		if (financials.total_usd !== 0) {
			pdfDocument.fontSize(12).text(locales['contributions-usd'] + financials.total_usd);
		}
		if (financials.total_chf === 0 && financials.total_eur === 0 && financials.total_usd === 0) {
			pdfDocument.fontSize(10).font('Helvetica-Oblique').text(locales['no-contributions']);
		}
		pdfDocument.moveDown();
		pdfDocument
			.fontSize(12)
			.font('Helvetica')
			.text(locales['time-period-1'] + year + locales['time-period-2'] + year + locales['time-period-3']);
		pdfDocument.moveDown();
		pdfDocument.fontSize(12).text(locales['information-1']);
		pdfDocument.moveDown();
		pdfDocument.fontSize(12).text(locales['information-2']);
		pdfDocument.moveDown(2);
		pdfDocument.fontSize(12).text(locales['information-3']);
		pdfDocument.moveDown(2);
		let yPosition = pdfDocument.y;
		pdfDocument.image('dist/assets/signatures/signature_sandino.png', 45, yPosition, { width: 200 });
		pdfDocument.image('dist/assets/signatures/signature_kerrin.png', 280, yPosition, { width: 200 });
		pdfDocument.moveDown();
		yPosition = pdfDocument.y;
		pdfDocument.fontSize(10).text('Sandino Scheidegger', 45, yPosition);
		pdfDocument.fontSize(10).text('Kerrin Dieckmann', 280, yPosition);
		yPosition = pdfDocument.y;
		pdfDocument.fontSize(9).text(locales['signature-1'], 45, yPosition);
		pdfDocument.fontSize(9).text(locales['signature-2'], 280, yPosition);
		pdfDocument.text(locales['footer-1'], 45, pdfDocument.page.height - 150);
		pdfDocument.text(locales['footer-2'], 245, pdfDocument.page.height - 150);
		pdfDocument.text(locales['footer-3'], 445, pdfDocument.page.height - 150);
		pdfDocument.pipe(writeStream);
		writeStream.on('finish', () => resolve());
		pdfDocument.end();
	});
};
