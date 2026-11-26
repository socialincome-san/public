import { resultFail, resultOk } from '@/lib/result';
import { isRecipientPhoneNumberPreselected } from './recipient-auth.service';

const mockFindRecipientByPaymentPhoneNumber = jest.fn();

jest.mock('./recipient.repository.read', () => ({
	findRecipientByPaymentPhoneNumber: (...args: unknown[]): unknown => mockFindRecipientByPaymentPhoneNumber(...args),
}));

test('returns true when the phone number belongs to a preselected recipient', async () => {
	mockFindRecipientByPaymentPhoneNumber.mockResolvedValue({ id: 'recipient-1' });

	expect(await isRecipientPhoneNumberPreselected('+41791234567')).toEqual(resultOk(true));
	expect(mockFindRecipientByPaymentPhoneNumber).toHaveBeenCalledWith('+41791234567');
});

test('returns false when the phone number is not registered to a recipient', async () => {
	mockFindRecipientByPaymentPhoneNumber.mockResolvedValue(null);

	expect(await isRecipientPhoneNumberPreselected('+41791234567')).toEqual(resultOk(false));
});

test('logs repository errors and returns a failure result', async () => {
	const error = new Error('Database unavailable');
	const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
	mockFindRecipientByPaymentPhoneNumber.mockRejectedValue(error);

	expect(await isRecipientPhoneNumberPreselected('+41791234567')).toEqual(
		resultFail('Could not check recipient phone number'),
	);
	expect(consoleError).toHaveBeenCalledWith(error);
	consoleError.mockRestore();
});
