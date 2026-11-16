import { requestTwilioOtp } from './twilio-otp.integration';

const mockCreateVerification = jest.fn();

jest.mock('./twilio-client.integration', () => ({
	getTwilioClient: (): Promise<unknown> =>
		Promise.resolve({
			success: true,
			data: { verify: { v2: { services: () => ({ verifications: { create: mockCreateVerification } }) } } },
		}),
}));

beforeEach(() => {
	jest.clearAllMocks();
	jest.spyOn(console, 'error').mockImplementation(() => undefined);
	process.env.TWILIO_VERIFY_SERVICE_SID = 'VA123';
});

test.each([
	[{ status: 429, code: 60203 }, 429],
	[{ status: 400, code: 60200 }, 400],
	[{ status: 400, code: 60006 }, 400],
	[{ status: 403, code: 60205 }, 400],
	[{ status: 400, code: 60223 }, 502],
	[{ status: 400 }, 502],
	[{ status: 503 }, 502],
	[{}, 502],
])('maps Twilio error %j to %s', async (twilioError, expectedStatus) => {
	mockCreateVerification.mockRejectedValue(twilioError);

	const result = await requestTwilioOtp('+41791234567');

	expect(result).toMatchObject({ success: false, status: expectedStatus });
});

test('reports a missing verify service as a server error', async () => {
	delete process.env.TWILIO_VERIFY_SERVICE_SID;

	expect(await requestTwilioOtp('+41791234567')).toMatchObject({ success: false, status: 500 });
});
