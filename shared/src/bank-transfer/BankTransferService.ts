import { UserRecord } from 'firebase-admin/auth';
import { DocumentReference } from 'firebase-admin/firestore';
import { DateTime } from 'luxon';
import { AuthAdmin } from '../firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '../firebase/admin/FirestoreAdmin';
import { toFirebaseAdminTimestamp } from '../firebase/admin/utils';
import {
	BankWireContribution,
	CONTRIBUTION_FIRESTORE_PATH,
	ContributionSourceKey,
	StatusKey,
} from '../types/contribution';
import { Currency } from '../types/currency';
import { User, USER_FIRESTORE_PATH } from '../types/user';
import { rndString } from '../utils/crypto';

export type BankTransferUser = {
	email: string;
	firstName: string;
	lastName: string;
	paymentReferenceId: number;
};

export type BankTransferPayment = {
	amount: number;
	intervalCount: number;
	currency: string;
	recurring: boolean;
};

export class BankTransferService {
	constructor(private readonly firestoreAdmin: FirestoreAdmin) {}

	async storeCharge(payment: BankTransferPayment, userData: BankTransferUser) {
		const contribution = this.buildContribution(payment);

		const authUser = await this.getOrCreateAuthUser(userData);
		const userRef = await this.getOrCreateFirestoreUser(userData, contribution.currency, authUser.uid);
		const contributionRef = userRef.collection(CONTRIBUTION_FIRESTORE_PATH).doc(contribution.reference_id);
		await contributionRef.set(contribution, { merge: true });
		console.info(`Updated contribution document: ${contributionRef.path}`);
		return contributionRef;
	}

	private async getOrCreateAuthUser(user: BankTransferUser): Promise<UserRecord> {
		const authAdmin = new AuthAdmin();
		try {
			return await authAdmin.auth.getUserByEmail(user.email);
		} catch (error: any) {
			return await authAdmin.auth.createUser({
				email: user.email,
				password: await rndString(16),
				displayName: `${user.firstName} ${user.lastName}`,
			});
		}
	}

	private async getOrCreateFirestoreUser(
		userData: BankTransferUser,
		currency: Currency,
		authUserId: string,
	): Promise<DocumentReference<User>> {
		const existingUserDoc = await this.firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (col) =>
			col.where('payment_reference_id', '==', userData.paymentReferenceId),
		);

		if (existingUserDoc) {
			return existingUserDoc.ref;
		}

		const userDoc = await this.firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).add({
			email: userData.email,
			auth_user_id: authUserId,
			personal: {
				name: userData.firstName,
				lastname: userData.lastName,
			},
			address: {
				country: 'CH',
			},
			currency,
			payment_reference_id: userData.paymentReferenceId,
			created_at: toFirebaseAdminTimestamp(DateTime.now()),
		});

		return userDoc;
	}

	private buildContribution(payment: BankTransferPayment): BankWireContribution {
		return {
			source: ContributionSourceKey.WIRE_TRANSFER,
			created: toFirebaseAdminTimestamp(DateTime.now()),
			amount: payment.amount,
			currency: payment.currency as Currency,
			amount_chf: payment.amount,
			fees_chf: 0,
			status: StatusKey.PENDING,
			monthly_interval: payment.intervalCount,
			reference_id: DateTime.now().toMillis().toString(),
			transaction_id: '',
			raw_content: '',
		};
	}
}
