import { retrieveStripeCheckoutSession } from '@/integrations/stripe/stripe.integration';
import { hasSucceededContributionsBefore } from '@/modules/contributions/contribution.service';
import { findContributorByStripeCustomerOrEmail } from '@/modules/contributors/contributor.service';
import { getPaidCheckoutDonation } from './stripe-payment.service';

jest.mock('@/integrations/stripe/stripe.integration', () => ({
	resolveStripeResourceId: (value: string | { id: string } | null | undefined) =>
		typeof value === 'string' ? value : (value?.id ?? null),
	retrieveStripeCheckoutSession: jest.fn(),
}));

jest.mock('./stripe-payment.repository', () => ({}));

jest.mock('@/modules/subscriptions/subscription.service', () => ({}));

jest.mock('@/modules/campaigns/campaign.service', () => ({}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorByStripeCustomerOrEmail: jest.fn(),
}));

jest.mock('@/modules/contributions/contribution.service', () => ({
	hasSucceededContributionsBefore: jest.fn(),
}));

jest.mock('@/modules/program-access/program-access.service', () => ({}));

jest.mock('@/modules/users/user.service', () => ({}));

const mockRetrieveStripeCheckoutSession = retrieveStripeCheckoutSession as jest.Mock;
const mockFindContributor = findContributorByStripeCustomerOrEmail as jest.Mock;
const mockHasSucceededContributionsBefore = hasSucceededContributionsBefore as jest.Mock;

const sessionCreated = 1_760_947_200;

const paidSession = {
	id: 'cs_123',
	ui_mode: 'embedded_page',
	status: 'complete',
	payment_status: 'paid',
	amount_total: 5000,
	currency: 'chf',
	mode: 'payment',
	created: sessionCreated,
	customer: 'cus_123',
	customer_details: { email: 'donor@example.org' },
};

const getDonorStatus = async () => {
	const result = await getPaidCheckoutDonation('cs_123');
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data.donorStatus;
};

describe('getPaidCheckoutDonation donor status', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockRetrieveStripeCheckoutSession.mockResolvedValue({ success: true, data: paidSession });
	});

	it('is new when the account has no contributor yet', async () => {
		mockFindContributor.mockResolvedValue({ success: true, data: null });

		expect(await getDonorStatus()).toBe('new');
		expect(mockFindContributor).toHaveBeenCalledWith('cus_123', 'donor@example.org');
		expect(mockHasSucceededContributionsBefore).not.toHaveBeenCalled();
	});

	it('is returning when the contributor had successful contributions before this checkout started', async () => {
		mockFindContributor.mockResolvedValue({ success: true, data: { id: 'contributor-1' } });
		mockHasSucceededContributionsBefore.mockResolvedValue({ success: true, data: true });

		expect(await getDonorStatus()).toBe('returning');
		expect(mockHasSucceededContributionsBefore).toHaveBeenCalledWith('contributor-1', new Date(sessionCreated * 1000));
	});

	it('is new when the contributor had no earlier successful contributions', async () => {
		mockFindContributor.mockResolvedValue({ success: true, data: { id: 'contributor-1' } });
		mockHasSucceededContributionsBefore.mockResolvedValue({ success: true, data: false });

		expect(await getDonorStatus()).toBe('new');
	});

	it('still returns the paid donation, without a donor status, when the lookup fails', async () => {
		mockFindContributor.mockResolvedValue({ success: false, error: 'Could not find contributor' });

		expect(await getPaidCheckoutDonation('cs_123')).toEqual({
			success: true,
			data: { checkoutSessionId: 'cs_123', amount: 50, currency: 'CHF', recurring: false, donorStatus: undefined },
		});
	});
});
