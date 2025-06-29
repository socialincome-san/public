import { firestoreAdmin } from '@/firebase-admin';
import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { DateTime } from 'luxon';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	const { email } = await request.json();

	const existingUser = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (col) =>
		col.where('email', '==', email),
	);

	return NextResponse.json({
		paymentReferenceId: existingUser?.get('payment_reference_id') ?? DateTime.now().toMillis(),
	});
}
