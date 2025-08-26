import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
	const { payoutId } = await params;

	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return NextResponse.json({ ok: false, error: recipientResult.error }, { status: recipientResult.status ?? 500 });
	}

	const payoutResult = await service.getPayoutByRecipientAndId(recipientResult.data.id, payoutId);
	return payoutResult.success
		? NextResponse.json({ ok: true, data: payoutResult.data }, { status: payoutResult.status ?? 200 })
		: NextResponse.json({ ok: false, error: payoutResult.error }, { status: payoutResult.status ?? 500 });
}
