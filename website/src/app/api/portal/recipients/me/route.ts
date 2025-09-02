import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);

	return recipientResult.success
		? NextResponse.json({ ok: true, data: recipientResult.data }, { status: recipientResult.status ?? 200 })
		: NextResponse.json({ ok: false, error: recipientResult.error }, { status: recipientResult.status ?? 500 });
}

export async function PATCH(request: Request) {
	const service = new PortalApiService();

	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return NextResponse.json({ ok: false, error: recipientResult.error }, { status: recipientResult.status ?? 500 });
	}

	const body = await request.json();

	if (!body.firstName && !body.lastName) {
		return NextResponse.json({ ok: false, error: 'Provide firstName or lastName' }, { status: 400 });
	}

	const updateResult = await service.updateRecipientUserFields(recipientResult.data.id, body);

	return updateResult.success
		? NextResponse.json({ ok: true, data: updateResult.data }, { status: updateResult.status ?? 200 })
		: NextResponse.json({ ok: false, error: updateResult.error }, { status: updateResult.status ?? 500 });
}
