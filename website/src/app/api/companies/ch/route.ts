import { NextResponse } from 'next/server';

type ZefixCompany = {
	uid: string;
	name: string;
	legalSeat: string;
	// ...
};

const ZEFIX_COMPANY_SEARCH_URL = 'https://www.zefix.admin.ch/ZefixPublicREST/api/v1/company/search';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const searchTerm = searchParams.get('searchTerm');

	try {
		const result = await fetch(ZEFIX_COMPANY_SEARCH_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: process.env.ZEFIX_API_KEY!,
			},
			body: JSON.stringify({
				name: searchTerm,
				activeOnly: true,
			}),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(response.status.toString());
				} else {
					return response.json();
				}
			})
			.then((response_json) => NextResponse.json(response_json));
		return result;
	} catch (error) {
		// TODO : add more descriptive error
		const response = new Response(null, { status: 400 });
		return response;
	}
}
