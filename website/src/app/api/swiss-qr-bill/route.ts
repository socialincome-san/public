import { NextResponse } from 'next/server';
const { SwissQRCode } = require('swissqrbill/svg');

export type CreateSwissQrBill = { amount: number };
type CreateSwissQrBillRequest = { json(): Promise<CreateSwissQrBill> } & Request;

export async function POST(request: CreateSwissQrBillRequest) {
	const { amount } = await request.json();

	const data = {
		amount,
		currency: 'CHF',
		creditor: {
			account: 'CH6730000001151126386',
			name: 'Social Income',
			address: 'Zweierstrasse',
			buildingNumber: 103,
			city: 'Zürich',
			zip: 8003,
			country: 'CH',
		},
		av1: 'av1: test1234',
		av2: 'av2: test1234',
		message: 'Contribution by test1234',
		reference: '000000017013512241470000010',
		// debtor: {
		// 	address: 'Musterstrasse',
		// 	buildingNumber: 1,
		// 	city: 'Musterstadt',
		// 	country: 'CH',
		// 	name: 'Peter Muster',
		// 	zip: 1234,
		// },
	};

	const svg = new SwissQRCode(data);

	return NextResponse.json({ svg: svg.toString() });
}
