import { PortalApiService } from '@/app/api/portal/portal-api.service';
import { PayoutStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { payoutId: string } }) {
	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return NextResponse.json({ ok: false, error: recipientResult.error }, { status: recipientResult.status ?? 500 });
	}

	const updateResult = await service.updatePayoutStatus(
		recipientResult.data.id,
		params.payoutId,
		PayoutStatus.contested,
	);
	return updateResult.success
		? NextResponse.json({ ok: true, data: updateResult.data }, { status: updateResult.status ?? 200 })
		: NextResponse.json({ ok: false, error: updateResult.error }, { status: updateResult.status ?? 500 });
}
