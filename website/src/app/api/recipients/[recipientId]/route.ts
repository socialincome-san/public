import { requireIdToken } from '@/lib/firebase/require-id-token';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: Promise<{ recipientId: string }> }) {
	const { recipientId } = await context.params;

	const decoded: DecodedIdToken | null = await requireIdToken(request);
	if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

	const service = new RecipientService();
	let phoneNumber = decoded.phone_number;
	if (!phoneNumber) {
		return NextResponse.json({ message: 'Phone number not found in token' }, { status: 400 });
	}

	phoneNumber = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;

	const result = await service.getRecipientForMobileMoneyPhone(recipientId, phoneNumber);

	if (!result.success) return NextResponse.json({ message: 'Error fetching recipient' }, { status: 500 });
	if (!result.data) return NextResponse.json({ message: 'Recipient not found' }, { status: 404 });

	return NextResponse.json(result.data);
}
