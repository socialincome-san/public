/**
 * Generates a QR bill reference according to the following format:
 * - 3 digits trailing zeros
 * - 13 digits payment reference ID for contributor (unix timestamp in milliseconds)
 * - 10 digits payment reference ID for contribution (unix timestamp in seconds)
 * - 1 digit check digit (modulo 10 recursive)
 */

import {
	CONTRIBUTION_REFERENCE_ID_LENGTH,
	CONTRIBUTOR_REFERENCE_ID_LENGTH,
} from '@/lib/services/bank-transfer/bank-transfer-config';
import { SwissQRBill, SwissQRCode } from 'swissqrbill/svg';
import { Data } from 'swissqrbill/types';

/**
 * Calculates the modulo 10 recursive check digit for the QR bill reference
 * @param reference The reference number without check digit
 * @returns The check digit (0-9)
 */
function calculateCheckDigit(reference: string): number {
	const weights = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
	let carry = 0;

	for (let i = 0; i < reference.length; i++) {
		const digit = parseInt(reference[i], 10);
		carry = weights[(carry + digit) % 10];
	}

	return (10 - carry) % 10;
}

/**
 * Generates a QR bill reference
 * @param contributorCreatedAt The timestamp when the user was created (in milliseconds)
 * @param contributionCreatedAt The timestamp when the contribution was created (in seconds)
 * @returns The complete QR bill reference with check digit
 */
function generateQrBillReference(contributorCreatedAt: string, contributionCreatedAt: string): string {
	if (contributorCreatedAt.length > CONTRIBUTOR_REFERENCE_ID_LENGTH) throw new Error('contributorCreatedAt too long');
	if (contributionCreatedAt.length > CONTRIBUTION_REFERENCE_ID_LENGTH)
		throw new Error('contributionCreatedAt too long, should be timestamp in seconds');

	// Create the base reference without check digit
	const baseReference = `000${contributorCreatedAt}${contributionCreatedAt}`;

	// Calculate and append check digit
	const checkDigit = calculateCheckDigit(baseReference);

	return `${baseReference}${checkDigit}`;
}

type GenerateQrBillSvgProps = {
	amount: number;
	contributorReferenceId: string;
	contributionReferenceId: string;
	currency: 'CHF' | 'EUR';
	type: 'QRCODE' | 'QRBILL';
};

export function generateQrBillSvg({
	amount,
	contributorReferenceId,
	contributionReferenceId,
	currency,
	type,
}: GenerateQrBillSvgProps): string {
	const data: Data = {
		amount: Number(amount),
		currency: currency,
		creditor: {
			account: 'CH6730000001151126386',
			address: 'Zweierstrasse',
			buildingNumber: 103,
			zip: 8003,
			city: 'Zürich',
			country: 'CH',
			name: 'Social Income',
		},
		reference: generateQrBillReference(contributorReferenceId, contributionReferenceId),
	};

	return type === 'QRCODE' ? new SwissQRCode(data).toString() : new SwissQRBill(data).toString();
}
