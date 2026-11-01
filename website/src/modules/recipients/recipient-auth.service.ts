import { resultFail, resultOk, type Result } from '@/lib/result';
import * as recipientRepository from './recipient.repository.read';

export const isRecipientPhoneNumberPreselected = async (phoneNumber: string): Promise<Result<boolean>> => {
	try {
		return resultOk((await recipientRepository.findRecipientByPaymentPhoneNumber(phoneNumber)) !== null);
	} catch (error) {
		console.error(error);

		return resultFail('Could not check recipient phone number');
	}
};
