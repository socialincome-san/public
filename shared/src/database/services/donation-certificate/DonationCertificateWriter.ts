import assert from 'assert';
import { createWriteStream } from 'fs';
import _ from 'lodash';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { LANGUAGE_CODES } from '../../../types/language';
import { Translator } from '../../../utils/i18n';
import { ContributionDonationEntry } from '../contribution/contribution.types';
import { ContributorDonationCertificate } from '../contributor/contributor.types';

export const ASSET_DIR = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'assets');

export class DonationCertificateWriter {
	public readonly year: number;
	public readonly donator: ContributorDonationCertificate;
	public readonly contributions: ContributionDonationEntry[];

	constructor(donator: ContributorDonationCertificate, contributions: ContributionDonationEntry[], year: number) {
		assert(donator.address?.country === 'CH', 'Donation Certificates are supported for Swiss residents');
		this.donator = donator;
		this.year = year;
		this.contributions = contributions;
	}

	private getContributionsByCurrency = async (contributions: ContributionDonationEntry[], year: number) => {
		return _(contributions)
			.filter((contribution) => contribution.createdAt.getFullYear() === year)
			.groupBy((contribution) => contribution.currency)
			.mapValues((contributions) => _.sumBy(contributions, (contribution) => contribution.amount));
	};

	/**
	 * This function creates a donation certificate.
	 * The function terminates when the PDF file has been written to the file at the given path.
	 */
	writeDonationCertificatePDF = async (filePath: string) => {
		const contributionsByCurrency = await this.getContributionsByCurrency(this.contributions, this.year);

		const translator = await Translator.getInstance({
			language: LANGUAGE_CODES.find((l) => l === this.donator.language) || 'de',
			namespaces: ['donation-certificate', 'countries'],
		});

		const header = translator.t('header');
		const location = translator.t('location', { context: { date: new Date() } });
		const country = translator.t(this.donator.address?.country as string, { namespace: 'countries' });
		const title = translator.t('title', { context: { year: this.year } });
		const text1 = translator.t('text-1', {
			context: {
				firstname: this.donator.firstName,
				lastname: this.donator.lastName,
				city: this.donator.address?.city,
				year: this.year,
			},
		});
		const text2 = translator.t('text-2', {
			context: {
				start: new Date(this.year, 0, 1),
				end: new Date(this.year, 11, 31),
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
			pdfDocument.text(`${this.donator.firstName} ${this.donator.lastName}`);
			pdfDocument.text(`${this.donator.address?.street} ${this.donator.address?.number}`);
			pdfDocument.text(`${this.donator.address?.zip} ${this.donator.address?.city}`);
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

			if (contributionsByCurrency.size() === 0) {
				pdfDocument.text(translator.t('no-contributions'), { underline: true });
			} else {
				contributionsByCurrency.keys().forEach((currency) => {
					pdfDocument.text(
						'– ' +
							translator.t('contribution', {
								context: { currency, amount: contributionsByCurrency.get(currency), locale: 'de-CH' },
							}),
					);
				});
			}
			pdfDocument.moveDown();

			pdfDocument.text(text2);
			pdfDocument.moveDown();

			pdfDocument.text(text3);
			pdfDocument.moveDown();

			pdfDocument.text(text4);
			pdfDocument.moveDown(2);

			pdfDocument.text(text5);
			pdfDocument.moveDown(2);

			pdfDocument.image(path.join(ASSET_DIR, 'signatures', 'signature_sandino.png'), 45, yPosition, { width: 200 });
			pdfDocument.image(path.join(ASSET_DIR, 'signatures', 'signature_kerrin.png'), 240, yPosition, { width: 200 });
			pdfDocument.moveDown(4);

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
