import * as admin from 'firebase-admin';
import { FirestoreAdmin } from "../../../../shared/src/firebase/FirestoreAdmin";
import { SendMessageHandler } from '../../../src/messages/SendMessageHandler';
import { User } from '../../../../shared/src/types';

describe('send simple Sms', () => {
	test('send simple free text sms', async () => {
        const projectId = 'test-' + new Date().getTime();
        const firestoreAdmin = new FirestoreAdmin(admin.initializeApp({ projectId: projectId }));

        const messageSenderHandler = new SendMessageHandler(firestoreAdmin);

        const testUser: User = {
            personal: {
                name: "Mr.",
                lastname: "Beans",
                gender: "female",
                phone: "+41799999999",
            },
            email: "mr.beans@weirdo.co.uk",
            language: 'de',
            location: 'DE',
        };

        const testUserEntity = {
            id: 'TEST1234',
            values: testUser,
            path: "this is a test path"
        }

        const [successCount, skippedCount] = await messageSenderHandler.sendSmsMessage(
            "users",
		    [testUserEntity],
            {
                templatePath: "sms/freetext.hbs",
                translationNamespace: "freetext.json",
                context: {
                    content: "This is a test SMS"
                } 
            }
        )

		expect(successCount).toBe(1);
        expect(skippedCount).toBe(0);
	});
});