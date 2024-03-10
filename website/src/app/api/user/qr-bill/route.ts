import { NextResponse } from 'next/server';
const { SwissQRCode } = require("swissqrbill/svg");

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const firebaseAuthToken = searchParams.get('firebaseAuthToken');
	if (!firebaseAuthToken) {
		return new Response(null, { status: 400, statusText: 'Missing firebaseAuthToken' });
	}
	const data = {
		amount: 1994.75,
		creditor: {
			account: "CH44 3199 9123 0008 8901 2",
			address: "Musterstrasse",
			buildingNumber: 7,
			city: "Musterstadt",
			country: "CH",
			name: "SwissQRBill",
			zip: 1234
		},
		currency: "CHF",
		debtor: {
			address: "Musterstrasse",
			buildingNumber: 1,
			city: "Musterstadt",
			country: "CH",
			name: "Peter Muster",
			zip: 1234
		},
		reference: "21 00000 00003 13947 14300 09017"
	};

	const svg = new SwissQRCode(data);

	return NextResponse.json({ svg: svg.toString()})
};