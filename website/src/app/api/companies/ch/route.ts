import { NextResponse } from 'next/server';

type ZefixCompany = {
	uid: string;
	name: string;
	legalSeat: string;
	// ...
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const searchTerm = searchParams.get('searchTerm');

	const result = await fetch('https://www.zefix.admin.ch/ZefixPublicREST/api/v1/company/search', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: process.env.ZEFIX_API_KEY!,
		},
		body: JSON.stringify({
			name: searchTerm,
			activeOnly: true,
		}),
	});
	return NextResponse.json(await result.json());
}
