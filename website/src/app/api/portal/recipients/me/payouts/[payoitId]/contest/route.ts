import { PayoutStatus } from '@prisma/client';
import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

export async function POST(request: NextRequest, { params }: { params: Params }) {
	const { payoutId } = await params;

	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return NextResponse.json({ ok: false, error: recipientResult.error }, { status: recipientResult.status ?? 500 });
	}

	const updateResult = await service.updatePayoutStatus(recipientResult.data.id, payoutId, PayoutStatus.contested);

	return updateResult.success
		? NextResponse.json({ ok: true, data: updateResult.data }, { status: updateResult.status ?? 200 })
		: NextResponse.json({ ok: false, error: updateResult.error }, { status: updateResult.status ?? 500 });
}
