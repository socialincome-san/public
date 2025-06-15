import { UserRecord } from 'firebase-admin/auth';
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

		var isNewUser = false;
		const authAdmin = new AuthAdmin();

		// Check if user with given phoneNumber exists
		var userRecord = await getUserByPhoneNumber(authAdmin, phoneNumber);

		// If user does not exist, create a new Firebase Auth user
		if (userRecord == null) {
			console.log('User not found, creating new user');
			isNewUser = true;
			userRecord = await createUserWithPhoneNumber(authAdmin, phoneNumber);
		}

		// If user exists, generate custom auth token
		const customToken = await generateCustomToken(authAdmin, userRecord);

		// Return the custom token and user information
		return {
			success: true,
			token: customToken,
			isNewUser: isNewUser,
			uid: userRecord.uid,
		};
	} catch (error) {
		// Re-throw HttpsErrors as-is to preserve specific error messages
		if (error instanceof HttpsError) {
			throw error;
		}
		console.error('Unexpected error verifying OTP:', error);
		throw new HttpsError('internal', 'Failed to verify OTP');
	}

	async function getUserByPhoneNumber(authAdmin: AuthAdmin, phoneNumber: string): Promise<null | UserRecord> {
		try {
			return await authAdmin.auth.getUserByPhoneNumber(phoneNumber);
		} catch (error) {
			console.info('User not found with given phone number: ', error);
			return null;
		}
	}

	async function createUserWithPhoneNumber(authAdmin: AuthAdmin, phoneNumber: string): Promise<UserRecord> {
		try {
			userRecord = await authAdmin.auth.createUser({
				phoneNumber: phoneNumber,
			});
			console.log('New user created successfully: ', userRecord.uid);
			return userRecord;
		} catch (error) {
			console.error('Error creating new user:', error);
			throw new HttpsError('internal', 'Could not create user with given phone number: ', error);
		}
	}

	async function generateCustomToken(authAdmin: AuthAdmin, userRecord: UserRecord): Promise<string> {
		try {
			const customToken = await authAdmin.auth.createCustomToken(userRecord.uid);
			console.log('Custom token created for user: ', userRecord.uid);
			return customToken;
		} catch (error) {
			console.error('Some auth error occured: ', error);
			throw new HttpsError('internal', 'Could not create auth token for user with given phone number: ', error);
		}
	}
});

export default verifyOtpFunction;
