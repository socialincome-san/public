import { AuthAdmin } from '../../../../../shared/src/firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { Twilio } from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } from '../../../config';

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
	throw new Error('Missing Twilio environment variables');
}

const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Cloud function to verify OTP sent by Twilio
 * If valid, it creates/gets a Firebase user and returns a custom token
 */
const verifyOtpFunction = onCall({ maxInstances: 10 }, async (request) => {
	console.log('Function called with request:', request.data);
	let { phoneNumber, otp } = request.data;

	// Validate inputs
	if (!phoneNumber || !otp) {
		console.log('Missing phone number or OTP');
		throw new HttpsError('invalid-argument', 'Phone number and OTP are required');
	}

	try {
		// Format phone number to E.164 format if not already
		if (!phoneNumber.startsWith('+')) {
			phoneNumber = `+${phoneNumber}`;
		}

		// Basic E.164 validation (should start with + followed by digits only)
		const phoneRegex = /^\+[1-9]\d{1,14}$/;
		if (!phoneRegex.test(phoneNumber)) {
			console.log('Invalid phone number format:', phoneNumber);
			throw new HttpsError('invalid-argument', 'Phone number must be in valid E.164 format (e.g., +12345678901)');
		}

		console.log(`Attempting to verify OTP for phone: ${phoneNumber}`);
		// Verify OTP with Twilio
		const verification = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
			to: phoneNumber,
			code: otp,
		});

		console.log('Twilio verification response:', verification);

		// Check if verification was successful
		if (verification.status !== 'approved') {
			console.log('OTP verification failed, status:', verification.status);
			throw new HttpsError('permission-denied', 'Invalid OTP provided');
		}

		// OTP is valid, create or get Firebase user
		const authAdmin = new AuthAdmin();
		const firestoreAdmin = new FirestoreAdmin();
		console.log('OTP verified successfully, checking if user exists');

		// First check if a user with this phone number already exists
		try {
			const userRecord = await authAdmin.auth.getUserByPhoneNumber(phoneNumber);
			console.log('Existing user found:', userRecord.uid);

			// User exists, generate custom token
			const customToken = await authAdmin.auth.createCustomToken(userRecord.uid);
			console.log('Custom token created for existing user');

			return {
				success: true,
				token: customToken,
				isNewUser: false,
				uid: userRecord.uid,
			};
		} catch (error) {
			console.log('Error: ', error);
			console.log('User not found, creating new user');
			// User doesn't exist, create a new one
			const userRecord = await authAdmin.auth.createUser({
				phoneNumber,
			});

			console.log('New user created:', userRecord.uid);

			// Store user in Firestore
			await firestoreAdmin.firestore.collection('users').doc(userRecord.uid).set({
				phoneNumber,
				createdAt: new Date(),
			});
			console.log('User data stored in Firestore');

			// Generate custom token
			const customToken = await authAdmin.auth.createCustomToken(userRecord.uid);
			console.log('Custom token created for new user');

			return {
				success: true,
				token: customToken,
				isNewUser: true,
				uid: userRecord.uid,
			};
		}
	} catch (error) {
		console.error('Error verifying OTP:', error);
		throw new HttpsError('internal', 'Failed to verify OTP', error);
	}
});

export default verifyOtpFunction;
