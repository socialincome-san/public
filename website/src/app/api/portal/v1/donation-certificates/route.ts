import { DonationCertificateService } from '@socialincome/shared/src/database/services/donation-certificate/donation-certificate.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Create Donation Certificates
 * @description Creates donation certificate PDFs and adds corresponding entries to DB.
 * @auth apikey
 *   type: apiKey
 *   in: header
 *   name: x-api-key
 * @response 201 - Dontation certificates created successfully
 * @openapi
 */
export async function POST(request: NextRequest) {
	const apiKey = request.headers.get('x-api-key');

	// TODO: rename env var to be named more generic
	if (apiKey !== process.env.EXCHANGE_RATES_IMPORT_API || !process.env.EXCHANGE_RATES_IMPORT_API) {
		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	let body: any;

	try {
		body = await request.json();
	} catch (e) {
		return new NextResponse('Invalid JSON body: ' + e, { status: 400 });
	}

	if (!body.contributorIds || !Array.isArray(body.contributorIds))
		return new NextResponse('Invalid request, contributorIds missing', { status: 400 });

	const service = new DonationCertificateService();
	// TODO: set year
	const year = 2024;

	try {
		const result = await service.createDonationCertificates(year, body.contributorIds);
		if (!result.success) {
			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}
		return NextResponse.json({}, { status: 201 });
	} catch (error) {
		console.error('Error during exchange rate import:', error);
		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
}
