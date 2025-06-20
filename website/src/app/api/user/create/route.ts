import { firestoreAdmin } from '@/firebase-admin';
import { toFirebaseAdminTimestamp } from '@socialincome/shared/src/firebase/admin/utils';
import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { DateTime } from 'luxon';
import { NextApiRequest } from 'next';

export type CreateUserData = Pick<User, 'address' | 'personal' | 'email' | 'currency'>;
type CreateUserRequest = { json(): Promise<CreateUserData> } & NextApiRequest;

export async function POST(request: CreateUserRequest) {
	const { email, personal, address, currency } = await request.json();

	const user = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (col) => col.where('email', '==', email));
	if (user) {
		return new Response(null, { status: 400, statusText: 'User already exists' });
	}

	if (!address.country) {
		return new Response(null, { status: 400, statusText: 'Country not found' });
	}

	const paymentReferenceId = DateTime.now().toMillis();

	await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).add({
		email,
		personal: {
			name: personal?.name,
			lastname: personal?.lastname,
		},
		payment_reference_id: paymentReferenceId,
		currency,
		test_user: false,
		created_at: toFirebaseAdminTimestamp(DateTime.now()),
		address: {
			country: address.country,
		},
	});

	return new Response(JSON.stringify({ payment_reference_id: paymentReferenceId }), { status: 200 });
}
