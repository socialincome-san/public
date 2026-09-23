import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import DOMPurify from 'isomorphic-dompurify';
import PDFDocument from 'pdfkit';
import { SwissQRBill as SwissQrBillPdf } from 'swissqrbill/pdf';
import { SwissQRCode } from 'swissqrbill/svg';
import type { Data } from 'swissqrbill/types';

type QrBillInput = {
	amount: number;
	contributorReferenceId: string;
	contributionReferenceId: string;
	currency: 'CHF' | 'EUR';
};

const CONTRIBUTOR_REFERENCE_ID_LENGTH = 13;
const CONTRIBUTION_REFERENCE_ID_LENGTH = 10;
const CREDITOR = {
	account: 'CH6730000001151126386',
	address: 'Zweierstrasse',
	buildingNumber: 103,
	zip: 8003,
	city: 'Zürich',
	country: 'CH',
	name: 'Social Income',
};

export const buildQrBillDisplayData = (
	input: QrBillInput,
): {
	creditor: typeof CREDITOR;
	reference: string;
} => ({
	creditor: CREDITOR,
	reference: generateQrBillReference(input.contributorReferenceId, input.contributionReferenceId),
});

const buildQrBillData = ({ amount, contributorReferenceId, contributionReferenceId, currency }: QrBillInput): Data => ({
	amount: Number(amount),
	currency,
	creditor: CREDITOR,
	reference: generateQrBillReference(contributorReferenceId, contributionReferenceId),
});

export const generateQrBillSvg = (input: QrBillInput): string => {
	const rawSvg = new SwissQRCode(buildQrBillData(input)).toString();

	return DOMPurify.sanitize(rawSvg, { USE_PROFILES: { svg: true, svgFilters: true } });
};

export const generateQrBillPdf = async (input: QrBillInput): Promise<ServiceResult<Buffer>> => {
	try {
		const data = buildQrBillData(input);
		const chunks: Buffer[] = [];
		const pdf = new PDFDocument({ size: 'A4' });
		const qrBill = new SwissQrBillPdf(data);

		return await new Promise<ServiceResult<Buffer>>((resolve) => {
			pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
			pdf.on('end', () => resolve(resultOk(Buffer.concat(chunks))));
			pdf.on('error', (error) => {
				console.error('Could not generate QR bill PDF', { error });
				resolve(resultFail('Could not generate QR bill PDF'));
			});

			qrBill.attachTo(pdf);
			pdf.end();
		});
	} catch (error) {
		console.error('Could not generate QR bill PDF', { error });

		return resultFail('Could not generate QR bill PDF');
	}
};

const generateQrBillReference = (contributorReferenceId: string, contributionReferenceId: string): string => {
	validateReferenceId(contributorReferenceId, CONTRIBUTOR_REFERENCE_ID_LENGTH, 'contributorReferenceId');
	validateReferenceId(contributionReferenceId, CONTRIBUTION_REFERENCE_ID_LENGTH, 'contributionReferenceId');

	const baseReference = `000${contributorReferenceId}${contributionReferenceId}`;

	return `${baseReference}${calculateCheckDigit(baseReference)}`;
};

const validateReferenceId = (value: string, maxLength: number, name: string): void => {
	if (!/^\d+$/.test(value) || value.length === 0 || value.length > maxLength) {
		throw new Error(`${name} must be 1–${maxLength} digits`);
	}
};

const calculateCheckDigit = (reference: string): number => {
	const weights = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
	let carry = 0;

	for (const character of reference) {
		const digit = Number.parseInt(character, 10);
		carry = weights[(carry + digit) % 10] ?? 0;
	}

	return (10 - carry) % 10;
};
