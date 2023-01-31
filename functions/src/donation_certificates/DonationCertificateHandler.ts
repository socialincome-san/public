import * as functions from 'firebase-functions';
import _ from 'lodash';
import { withFile } from 'tmp-promise';
import { StorageAdmin } from '../../..//shared/src/firebase/StorageAdmin';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import { Contribution, DonationCertificate, Entity, User } from '../../../shared/src/types';
import { sendEmail } from '../../../shared/src/utils/messaging/email';
import { renderTemplate } from '../../../shared/src/utils/templates';
import { Translator } from '../../../shared/src/utils/translate';
import { NOTIFICATION_EMAIL_PASSWORD, NOTIFICATION_EMAIL_USER } from '../config';
import { Timestamp } from '@google-cloud/firestore';
import { createWriteStream } from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { ASSET_DIR } from '../config';

export interface CreateDonationCertificatesFunctionProps {
	users: Entity<User>[];
	year: number;
	sendEmails: boolean;
}

export class DonationCertificateHandler {
	readonly firestoreAdmin: FirestoreAdmin;
	readonly storageAdmin: StorageAdmin;

	constructor(firestoreAdmin: FirestoreAdmin, storageAdmin: StorageAdmin) {
		this.firestoreAdmin = firestoreAdmin;
		this.storageAdmin = storageAdmin;
	}

	createDonationCertificates = functions.https.onCall(
		async ({ users, year, sendEmails }: CreateDonationCertificatesFunctionProps, { auth }) => {
			// TODO: Re-enable this check
			// await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);
			let [successCount, skippedCount] = [0, 0];
			for await (const userEntity of users) {
				const user = userEntity.values;
				try {
					await withFile(async ({ path }) => {
						if (!user.address?.country) throw new Error('Country of user unknown.');
						const translator = await Translator.getInstance({
							language: user.language || 'de',
							namespaces: ['donation-certificate', 'countries'],
						});

						// TODO: Use ContributionStatsCalculator to get contributions by user
						const contributionsByCurrency = await this.getContributionsByCurrency(userEntity.id, year);

						// TODO: Use @react-pdf/renderer instead of pdfkit, see DonationCertificatePDFTemplate.tsx
						await this.generateDonationCertificatePDF(userEntity, translator, year, contributionsByCurrency, path);

						const { downloadUrl } = await this.storageAdmin.uploadAndGetDownloadURL({
							sourceFilePath: path,
							destinationFilePath: `donation-certificates/${userEntity.id}/${year}_${user.address?.country}.pdf`,
						});
						this.storeDonationCertificate(userEntity.id, {
							url: downloadUrl,
							country: user.address.country,
							year: year,
						});
						if (sendEmails) {
							await sendEmail({
								to: user.email,
								subject: translator.t('email-subject'),
								// TODO: Use renderEmailTemplate() instead of renderTemplate()
								content: await renderTemplate({
									language: user.language || 'de',
									translationNamespace: 'donation-certificate',
									hbsTemplatePath: 'email/donation-certificate.hbs',
									context: {
										title: translator.t('title', { context: { year } }),
										signature: translator.t('title', { context: { year } }),
										firstname: user.personal?.name,
										year,
									},
								}),
								attachments: [
									{
										filename: translator.t('filename', { context: { year } }),
										path: path,
									},
								],
								user: NOTIFICATION_EMAIL_USER,
								password: NOTIFICATION_EMAIL_PASSWORD,
							});
						}
					});
					successCount += 1;
				} catch (e) {
					skippedCount += 1;
					console.error(e);
				}
			}
			return `Successfully created ${successCount} donation certificates for ${year} (${skippedCount} skipped)`;
		}
	);

	getContributionsByCurrency = async (userId: string, year: number) => {
		let contributions: Contribution[] = [];
		await this.firestoreAdmin
			.collection<Contribution>(`users/${userId}/contributions`)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((element) => {
					contributions.push(element.data());
				});
			})
			.catch((error) => {
				console.log('Error getting documents: ', error);
			});

		return _(contributions)
			.filter((contribution) => (contribution.created as Timestamp)?.toDate().getFullYear() === year)
			.groupBy((contribution) => contribution.currency)
			.mapValues((contributions) => _.sumBy(contributions, (contribution) => contribution.amount));
	};

	storeDonationCertificate = (userId: string, donationCertificate: DonationCertificate) => {
		this.firestoreAdmin
			.collection(`users/${userId}/donation-certificate`)
			.doc(`${donationCertificate.year}-${donationCertificate.country}`)
			.set(donationCertificate, { merge: true })
			.then(() => console.log(`Donation certificate document written for user ${userId}`));
	};

	generateDonationCertificatePDF = async (
		userEntity: Entity<User>,
		translator: Translator,
		year: number,
		contributionsByCurrency: _.Object<{ [currency: string]: number }>,
		filePath: string
	) => {
		const user = userEntity.values;
		const header = translator.t('header');
		const location = translator.t('location', { context: { date: new Date() } });
		const country = translator.t(user.address?.country as string, { namespace: 'countries' });
		const title = translator.t('title', { context: { year } });
		const text1 = translator.t('text-1', {
			context: {
				firstname: user.personal?.name,
				lastname: user.personal?.lastname,
				city: user.address?.city,
				year: 2022,
			},
		});
		const text2 = translator.t('text-2', {
			context: {
				start: new Date(year, 0, 1),
				end: new Date(year, 11, 31),
			},
		});
		const text3 = translator.t('text-3');
		const text4 = translator.t('text-4');
		const text5 = translator.t('text-5');

		const titleKerrin = translator.t('title-kerrin');
		const titleSandino = translator.t('title-sandino');

		const footerLeftLine1 = translator.t('footer-left-line-1');
		const footerLeftLine2 = translator.t('footer-left-line-2');
		const footerLeftLine3 = translator.t('footer-left-line-3');

		const footerMiddleLine1 = translator.t('footer-middle-line-1');
		const footerMiddleLine2 = translator.t('footer-middle-line-2');
		const footerMiddleLine3 = translator.t('footer-middle-line-3');

		const footerRightLine1 = translator.t('footer-right-line-1');
		const footerRightLine2 = translator.t('footer-right-line-2');
		const footerRightLine3 = translator.t('footer-right-line-3');

		return new Promise<void>(async (resolve) => {
			const pdfDocument = new PDFDocument({ size: 'A4' });
			const writeStream = createWriteStream(filePath);
			let yPosition;

			pdfDocument.registerFont('unica77', path.join(ASSET_DIR, 'fonts', '/Unica77LLTT-Regular.ttf'));
			pdfDocument.registerFont('unica77-bold', path.join(ASSET_DIR, 'fonts', 'Unica77LLTT-Bold.ttf'));
			pdfDocument.font('unica77');
			pdfDocument.image(path.join(ASSET_DIR, 'logos', 'logo_color@2x.png'), 45, 20, { width: 180 });
			pdfDocument.fontSize(10).text(header, 45, 20, { align: 'right' });
			pdfDocument.moveDown(6);
			pdfDocument.fontSize(12);
			pdfDocument.text(`${user.personal?.name} ${user.personal?.lastname}`);
			pdfDocument.text(`${user.address?.street}`);
			pdfDocument.text(`${user.address?.zip} ${user.address?.city}`);
			pdfDocument.text(country);

			pdfDocument.moveDown(6);
			pdfDocument.text(location);
			pdfDocument.moveDown(1.5);

			pdfDocument.font('unica77-bold');
			pdfDocument.text(title);
			pdfDocument.font('unica77');
			pdfDocument.moveDown(1.25);

			pdfDocument.text(text1);
			pdfDocument.moveDown();

			contributionsByCurrency.keys().forEach((currency) => {
				pdfDocument.text(
					'– ' + translator.t('contribution', { context: { currency, amount: contributionsByCurrency.get(currency) } })
				);
			});
			pdfDocument.moveDown();

			pdfDocument.text(text2);
			pdfDocument.moveDown();

			pdfDocument.text(text3);
			pdfDocument.moveDown();

			pdfDocument.text(text4);
			pdfDocument.moveDown(2);

			pdfDocument.text(text5);
			pdfDocument.moveDown(2);

			yPosition = pdfDocument.y;
			pdfDocument.image(path.join(ASSET_DIR, 'signatures', 'signature_sandino.png'), 45, yPosition, { width: 200 });
			pdfDocument.image(path.join(ASSET_DIR, 'signatures', 'signature_kerrin.png'), 240, yPosition, { width: 200 });
			pdfDocument.moveDown();

			yPosition = pdfDocument.y;
			pdfDocument.text('Sandino Scheidegger', 45, yPosition);
			pdfDocument.text('Kerrin Dieckmann', 240, yPosition);

			yPosition = pdfDocument.y;
			pdfDocument.text(titleSandino, 45, yPosition);
			pdfDocument.text(titleKerrin, 240, yPosition);
			pdfDocument.fontSize(10).text(footerLeftLine1, 45, pdfDocument.page.height - 70, { lineBreak: false });
			pdfDocument.text(footerLeftLine2, 45, pdfDocument.page.height - 55, { lineBreak: false });
			pdfDocument.text(footerLeftLine3, 45, pdfDocument.page.height - 40, { lineBreak: false });
			pdfDocument.text(footerMiddleLine1, 215, pdfDocument.page.height - 70, { lineBreak: false });
			pdfDocument.text(footerMiddleLine2, 215, pdfDocument.page.height - 55, { lineBreak: false });
			pdfDocument.text(footerMiddleLine3, 215, pdfDocument.page.height - 40, { lineBreak: false });
			pdfDocument.text(footerRightLine1, 405, pdfDocument.page.height - 70, { lineBreak: false });
			pdfDocument.text(footerRightLine2, 405, pdfDocument.page.height - 55, { lineBreak: false });
			pdfDocument.text(footerRightLine3, 405, pdfDocument.page.height - 40, { lineBreak: false });

			pdfDocument.pipe(writeStream);
			writeStream.on('finish', () => resolve());
			pdfDocument.end();
		});
	};
}
