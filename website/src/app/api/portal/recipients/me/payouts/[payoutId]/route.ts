import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { payoutId: string } }) {
	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return NextResponse.json({ ok: false, error: recipientResult.error }, { status: recipientResult.status ?? 500 });
	}

	const payoutResult = await service.getPayoutByRecipientAndId(recipientResult.data.id, params.payoutId);
	return payoutResult.success
		? NextResponse.json({ ok: true, data: payoutResult.data }, { status: payoutResult.status ?? 200 })
		: NextResponse.json({ ok: false, error: payoutResult.error }, { status: payoutResult.status ?? 500 });
}
