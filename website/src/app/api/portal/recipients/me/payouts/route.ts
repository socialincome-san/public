import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return NextResponse.json({ ok: false, error: recipientResult.error }, { status: recipientResult.status ?? 500 });
	}

	const payoutsResult = await service.getPayoutsByRecipientId(recipientResult.data.id);
	return payoutsResult.success
		? NextResponse.json({ ok: true, data: payoutsResult.data }, { status: payoutsResult.status ?? 200 })
		: NextResponse.json({ ok: false, error: payoutsResult.error }, { status: payoutsResult.status ?? 500 });
}
