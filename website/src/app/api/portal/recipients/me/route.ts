import { PortalApiService } from '@/app/api/portal/portal-api.service';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);

	return recipientResult.success
		? NextResponse.json({ ok: true, data: recipientResult.data }, { status: recipientResult.status ?? 200 })
		: NextResponse.json({ ok: false, error: recipientResult.error }, { status: recipientResult.status ?? 500 });
}
