const mockGetUserByEmail = jest.fn();
const mockUpdateUser = jest.fn();
const mockCreateUser = jest.fn();
const mockDeleteUser = jest.fn();

jest.mock('./firebase-admin.integration', () => ({
	getFirebaseAdminAuth: () => ({
		getUserByEmail: mockGetUserByEmail,
		updateUser: mockUpdateUser,
		createUser: mockCreateUser,
		deleteUser: mockDeleteUser,
	}),
	getFirebaseAdminAppCheck: jest.fn(),
}));

import { synchronizeFirebaseSurveyUser } from './firebase-auth.integration';

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
