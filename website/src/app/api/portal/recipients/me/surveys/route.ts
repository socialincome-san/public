import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const service = new PortalApiService();

	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return NextResponse.json({ ok: false, error: recipientResult.error }, { status: recipientResult.status ?? 500 });
	}

	const surveysResult = await service.getSurveysByRecipientId(recipientResult.data.id);

	return surveysResult.success
		? NextResponse.json({ ok: true, data: surveysResult.data }, { status: surveysResult.status ?? 200 })
		: NextResponse.json({ ok: false, error: surveysResult.error }, { status: surveysResult.status ?? 500 });
}
