import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const readClaimIds = (body: unknown): string[] => {
	if (typeof body !== 'object' || body === null || !('claimIds' in body)) {
		return [];
	}

	const { claimIds } = body;
	if (!Array.isArray(claimIds)) {
		return [];
	}

	return claimIds.filter((claimId): claimId is string => typeof claimId === 'string');
};

export const POST = async (request: NextRequest) => {
	const contributorSession = await getSessionByType('contributor');
	if (!contributorSession.success) {
		return NextResponse.json({ successfulClaimIds: [] }, { status: 200 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ errorCode: 'invalid-submission' }, { status: 400 });
	}

	const claimIds = readClaimIds(body);
	if (claimIds.length === 0) {
		return NextResponse.json({ successfulClaimIds: [] }, { status: 200 });
	}

	const result = await services.campaignPendingClaim.claimPendingCampaigns(contributorSession.data.id, claimIds);
	if (!result.success) {
		console.error(result.error);

		return NextResponse.json({ errorCode: 'submission-failed' }, { status: 503 });
	}

	return NextResponse.json(
		{
			successfulClaimIds: result.data.successfulClaimIds,
			...(result.data.campaignSlug ? { campaignSlug: result.data.campaignSlug } : {}),
		},
		{ status: 200 },
	);
};
