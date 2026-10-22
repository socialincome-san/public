const mockGetUserByEmail = jest.fn();
const mockUpdateUser = jest.fn();
const mockCreateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockGenerateSignInWithEmailLink = jest.fn();

jest.mock('./firebase-admin.integration', () => ({
	getFirebaseAdminAuth: () => ({
		getUserByEmail: mockGetUserByEmail,
		updateUser: mockUpdateUser,
		createUser: mockCreateUser,
		deleteUser: mockDeleteUser,
		generateSignInWithEmailLink: mockGenerateSignInWithEmailLink,
	}),
	getFirebaseAdminAppCheck: jest.fn(),
}));

import { generateFirebaseSignInLink, synchronizeFirebaseSurveyUser } from './firebase-auth.integration';

const userNotFoundError = (): Error & { code: string } => {
	const error = new Error('not found') as Error & { code: string };
	error.code = 'auth/user-not-found';

	return error;
};

describe('synchronizeFirebaseSurveyUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUpdateUser.mockResolvedValue({ uid: 'survey-uid' });
		mockCreateUser.mockResolvedValue({ uid: 'new-survey-uid' });
		mockDeleteUser.mockResolvedValue(undefined);
		mockGenerateSignInWithEmailLink.mockResolvedValue('https://example.org/?oobCode=one-time-token');
	});

	test('generates a sign-in link with the unchanged cross-browser continue URL', async () => {
		const continueUrl = 'https://socialincome.org/de/chf/auth/confirm-login?email=ada%40example.com&campaigns=Ab12Cd34';

		await expect(generateFirebaseSignInLink('ada@example.com', continueUrl)).resolves.toEqual({
			success: true,
			data: 'https://example.org/?oobCode=one-time-token',
		});
		expect(mockGenerateSignInWithEmailLink).toHaveBeenCalledWith('ada@example.com', {
			url: continueUrl,
			handleCodeInApp: true,
		});
	});

	test('does not log a failed generated sign-in link', async () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		mockGenerateSignInWithEmailLink.mockRejectedValue(new Error('provider response contains one-time-token'));

		await expect(
			generateFirebaseSignInLink(
				'ada@example.com',
				'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
			),
		).resolves.toEqual({ success: false, error: 'Could not generate sign-in link' });
		expect(consoleError).toHaveBeenCalledWith('Could not generate Firebase sign-in link');
		expect(consoleError.mock.calls.flat().join(' ')).not.toContain('one-time-token');
		consoleError.mockRestore();
	});

	test('refuses to overwrite an existing Firebase user that is not the survey user', async () => {
		mockGetUserByEmail.mockImplementation((email: string) => {
			if (email === 'victim@example.com') {
				return Promise.resolve({ uid: 'victim-uid', email });
			}

			return Promise.reject(userNotFoundError());
		});

		const result = await synchronizeFirebaseSurveyUser({
			nextEmail: 'victim@example.com',
			nextPassword: 'survey-password',
		});

		expect(result).toEqual({ success: false, error: 'Survey email is already in use' });
		expect(mockUpdateUser).not.toHaveBeenCalled();
		expect(mockCreateUser).not.toHaveBeenCalled();
		expect(mockDeleteUser).not.toHaveBeenCalled();
	});

	test('refuses email changes that would overwrite or delete an unrelated Firebase user', async () => {
		mockGetUserByEmail.mockImplementation((email: string) => {
			if (email === 'old@example.com') {
				return Promise.resolve({ uid: 'survey-uid', email });
			}
			if (email === 'victim@example.com') {
				return Promise.resolve({ uid: 'victim-uid', email });
			}

			return Promise.reject(userNotFoundError());
		});

		const result = await synchronizeFirebaseSurveyUser({
			previousEmail: 'old@example.com',
			nextEmail: 'victim@example.com',
			nextPassword: 'survey-password',
		});

		expect(result).toEqual({ success: false, error: 'Survey email is already in use' });
		expect(mockUpdateUser).not.toHaveBeenCalled();
		expect(mockDeleteUser).not.toHaveBeenCalled();
	});

	test('creates a Firebase user for a previously unused survey email', async () => {
		mockGetUserByEmail.mockImplementation(() => Promise.reject(userNotFoundError()));

		const result = await synchronizeFirebaseSurveyUser({
			nextEmail: 'survey@example.com',
			nextPassword: 'survey-password',
		});

		expect(result).toEqual({ success: true, data: undefined });
		expect(mockCreateUser).toHaveBeenCalledWith({
			email: 'survey@example.com',
			password: 'survey-password',
			emailVerified: true,
		});
		expect(mockUpdateUser).not.toHaveBeenCalled();
	});

	test('updates password for the owned survey user and deletes only the previous survey uid on email change', async () => {
		mockGetUserByEmail.mockImplementation((email: string) => {
			if (email === 'old@example.com') {
				return Promise.resolve({ uid: 'survey-uid', email });
			}

			return Promise.reject(userNotFoundError());
		});

		const result = await synchronizeFirebaseSurveyUser({
			previousEmail: 'old@example.com',
			nextEmail: 'new-survey@example.com',
			nextPassword: 'new-password',
		});

		expect(result).toEqual({ success: true, data: undefined });
		expect(mockCreateUser).toHaveBeenCalledWith({
			email: 'new-survey@example.com',
			password: 'new-password',
			emailVerified: true,
		});
		expect(mockDeleteUser).toHaveBeenCalledWith('survey-uid');
	});
});
