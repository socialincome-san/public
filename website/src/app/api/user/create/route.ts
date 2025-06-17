import { authAdmin, firestoreAdmin } from '@/firebase-admin';
import { toFirebaseAdminTimestamp } from '@socialincome/shared/src/firebase/admin/utils';
import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { rndString } from '@socialincome/shared/src/utils/crypto';
import { DateTime } from 'luxon';
import { NextApiRequest } from 'next';

export type CreateUserData = Pick<User, 'address' | 'personal' | 'email' | 'currency'>;
type CreateUserRequest = { json(): Promise<CreateUserData> } & NextApiRequest;

export async function POST(request: CreateUserRequest & Request) {
	const { email } = await request.json();
	const user = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (col) => col.where('email', '==', email));

	if (!user) {
		await createUser(email, request.body);
		return new Response(null, { status: 400, statusText: 'User not found' });
	}

	const authUserId = user.get('auth_user_id');

	if (authUserId) {
		return new Response(null, { status: 400, statusText: 'Auth user already exists' });
	}

	try {
		const userRecord = await authAdmin.auth.createUser({
			email: email,
			password: await rndString(16),
		});

		await user.ref.update({
			auth_user_id: userRecord.uid,
		});

		return new Response(null, { status: 200 });
	} catch (error) {
		console.error('Failed to create auth user', error);
		return new Response(null, { status: 500, statusText: 'Failed to create user' });
	}
}

const createUser = async (email: string, { address, personal, currency }: CreateUserData) => {
	if (!address.country) {
		throw new Error('Country not found');
	}

	const paymentReferenceId = DateTime.now().toMillis();

	return await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).add({
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
};

const validateUserRequestData = (request: CreateUserRequest) => {
	if (!request.body.personal) {
		throw new Error('Personal data not found');
	}

	if (!request.body.address) {
		throw new Error('Address not found');
	}

	if (!request.body.currency) {
		throw new Error('Currency not found');
	}
};
