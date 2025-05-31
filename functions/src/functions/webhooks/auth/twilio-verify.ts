import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { Twilio } from 'twilio';
import { AuthAdmin } from '../../../../../shared/src/firebase/admin/AuthAdmin';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } from '../../../config';

type VerifyRequest = {
	phoneNumber: string;
	otp: string;
};

/**
 * Cloud function to verify OTP sent by Twilio
 * If valid, it creates/gets a Firebase user and returns a custom token
 */
const verifyOtpFunction = onCall<VerifyRequest>(async (request) => {
	console.log('Function called for OTP verification');
	let { phoneNumber, otp } = request.data;

	if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
		throw new HttpsError('failed-precondition', 'Missing Twilio environment variables');
	}
	const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
			console.log('Invalid phone number format');
			throw new HttpsError('invalid-argument', 'Phone number must be in valid E.164 format (e.g., +12345678901)');
		}

		// Verify OTP with Twilio
		console.log('Attempting to verify OTP for phone');
		const verification = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
			to: phoneNumber,
			code: otp,
		});

		console.log(`Twilio verification response has status: '${verification.status}' and sid '${verification.sid}'`);

		// Check if verification was successful
		if (verification.status !== 'approved') {
			console.log('OTP verification failed, status: ', verification.status);
			throw new HttpsError('permission-denied', 'Invalid OTP provided');
		}

		// OTP is valid, create or get Firebase user
		console.log('OTP verified successfully, checking if user exists');

		// Check if user with given phoneNumber exists
		const authAdmin = new AuthAdmin();
		try {
			const userRecord = await authAdmin.auth.getUserByPhoneNumber(phoneNumber);
			console.log('Existing user found:', userRecord.uid);
		} catch (error) {
			console.log('User not found', error);
			throw new HttpsError('not-found', `User with the given phone number not found`);
		}

		// Check if a user with this phone number already exists
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
			console.log('User not found', error);
			throw new HttpsError('not-found', 'User with the given phone number not found');
		}
	} catch (error) {
		// Re-throw HttpsErrors as-is to preserve specific error messages
		if (error instanceof HttpsError) {
			throw error;
		}
		console.error('Unexpected error verifying OTP:', error);
		throw new HttpsError('internal', 'Failed to verify OTP');
	}
});

export default verifyOtpFunction;
