import { describe, test } from '@jest/globals';
import * as admin from 'firebase-admin';
import functions from 'firebase-functions-test';
import Stripe from 'stripe';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import { Contribution, ContributionSourceKey, StatusKey } from '../../../shared/src/types/admin/Contribution';
import { User, UserStatusKey } from '../../../shared/src/types/admin/User';
import { StripeWebhook } from '../../src/etl/StripeWebhook';
import Timestamp = admin.firestore.Timestamp;

describe('stripeWebhook', () => {
	const projectId = 'test-' + new Date().getTime();
	const testEnv = functions({ projectId });
	const firestoreAdmin = new FirestoreAdmin(admin.initializeApp({ projectId: projectId }));
	const stripeWebhook = new StripeWebhook(firestoreAdmin);

	beforeEach(async () => {
		await testEnv.firestore.clearFirestoreData({ projectId });
	});


    test('send Twilio SMS', () => {
        expect(add(1, 2)).toBe(3);
      });

});