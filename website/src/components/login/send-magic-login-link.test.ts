const mockReadPendingClaimIds = jest.fn(() => [] as string[]);

jest.mock('@/components/campaign/campaign-submission/pending-claim-ids', () => ({
	readPendingClaimIds: () => mockReadPendingClaimIds(),
}));

import { buildMagicLoginContinueUrl } from './send-magic-login-link';

describe('buildMagicLoginContinueUrl', () => {
	beforeEach(() => {
		mockReadPendingClaimIds.mockReturnValue([]);
	});

	test('includes email without campaigns when there are no pending claim ids', () => {
		const url = buildMagicLoginContinueUrl('https://socialincome.org', 'ada@example.com');

		expect(url).toBe('https://socialincome.org/auth/confirm-login?email=ada%40example.com');
	});

	test('appends pending claim ids as a comma-separated campaigns param', () => {
		mockReadPendingClaimIds.mockReturnValue(['Ab12Cd34', 'Xy98Zk76']);

		const url = buildMagicLoginContinueUrl('https://socialincome.org', 'ada@example.com');

		expect(url).toBe('https://socialincome.org/auth/confirm-login?email=ada%40example.com&campaigns=Ab12Cd34%2CXy98Zk76');
	});
});
