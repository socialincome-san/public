import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
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
    const { phoneNumber, otp } = request.data;

    // Validate inputs
    if (!phoneNumber || !otp) {
        throw new HttpsError('invalid-argument', 'Phone number and OTP are required');
    }

    try {
        // Verify OTP with Twilio
        const verification = await twilioClient.verify.v2
            .services(TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({
                to: phoneNumber,
                code: otp,
            });

        // Check if verification was successful
        if (verification.status !== 'approved') {
            throw new HttpsError('permission-denied', 'Invalid OTP provided');
        }

        // OTP is valid, create or get Firebase user
        const auth = getAuth();
        const db = getFirestore();

        // First check if a user with this phone number already exists
        try {
            const userRecord = await auth.getUserByPhoneNumber(phoneNumber);

            // User exists, generate custom token
            const customToken = await auth.createCustomToken(userRecord.uid);

            return {
                success: true,
                token: customToken,
                isNewUser: false,
                uid: userRecord.uid
            };
        } catch (error) {
            // User doesn't exist, create a new one
            const userRecord = await auth.createUser({
                phoneNumber,
            });

            // Store user in Firestore
            await db.collection('users').doc(userRecord.uid).set({
                phoneNumber,
                createdAt: new Date(),
            });

            // Generate custom token
            const customToken = await auth.createCustomToken(userRecord.uid);

            return {
                success: true,
                token: customToken,
                isNewUser: true,
                uid: userRecord.uid
            };
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new HttpsError('internal', 'Failed to verify OTP', error);
    }
});

export default verifyOtpFunction; 