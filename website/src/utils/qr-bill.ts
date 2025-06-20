/**
 * Generates a QR bill reference according to the following format:
 * - 7 digits trailing zeros
 * - 13 digits payment reference ID (unix timestamp in milliseconds)
 * - 4 digits reserved for future use (zeros for now)
 * - 2 digits payment interval in months
 * - 1 digit check digit (modulo 10 recursive)
 */

import { SwissQRBill } from 'swissqrbill/svg';

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
 * @param paymentIntervalMonths The payment interval in months
 * @param userCreatedAt The timestamp when the user was created (in milliseconds)
 * @returns The complete QR bill reference with check digit
 */
function generateQrBillReference(paymentIntervalMonths: number, userCreatedAt: number): string {
	// Ensure payment interval is 2 digits
	const formattedInterval = paymentIntervalMonths.toString().padStart(2, '0');

	// Create the base reference without check digit
	const baseReference = `0000000${userCreatedAt}0000${formattedInterval}`;

	// Calculate and append check digit
	const checkDigit = calculateCheckDigit(baseReference);

	return `${baseReference}${checkDigit}`;
}

type GenerateQrBillSvgProps = {
	amount: number;
	paymentIntervalMonths: number;
	paymentReferenceId: number;
	currency: 'CHF' | 'EUR';
};

export function generateQrBillSvg({
	amount,
	paymentIntervalMonths,
	paymentReferenceId,
	currency,
}: GenerateQrBillSvgProps): string {
	const svg = new SwissQRBill({
		amount: Number(amount),
		currency: currency,
		creditor: {
			account: 'CH44 3199 9123 0008 8901 2',
			address: 'Zweierstrasse',
			buildingNumber: 103,
			zip: 8003,
			city: 'Zürich',
			country: 'CH',
			name: 'Social Income',
		},
		reference: generateQrBillReference(paymentIntervalMonths, paymentReferenceId),
	});

	return svg.toString();
}
