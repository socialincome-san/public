import { ContributionStatus, Currency, PaymentEventType, ProgramPermission, UserRole } from '@/generated/prisma/enums';

const mockWriteRepository = {
	createContribution: jest.fn(),
	updateContribution: jest.fn(),
	createContributionFromStripe: jest.fn(),
	updateContributionFromStripe: jest.fn(),
	createContributionFromBankTransfer: jest.fn(),
	updateContributionFromBankTransfer: jest.fn(),
};
const mockFindPaymentEventByTransactionId = jest.fn();

jest.mock('./contribution.repository.write', () => mockWriteRepository);
jest.mock('./contribution.repository.read', () => ({
	findPaymentEventByTransactionId: mockFindPaymentEventByTransactionId,
	findCampaignById: () => Promise.resolve({ id: 'campaign-1', programId: 'program-1' }),
	findContributionForUpdate: () => Promise.resolve({ campaign: { programId: 'program-1' } }),
}));
jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorById: () => Promise.resolve({ success: true, data: { id: 'contributor-1' } }),
}));
jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: () =>
		Promise.resolve({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.operator }],
		}),
}));
jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({}));

import type { UserSession } from '@/modules/users/user.types';
import {
	createContribution,
	updateContribution,
	upsertFromBankTransfer,
	upsertFromStripeEvent,
} from './contribution.service';

const operator: UserSession = {
	type: 'user',
	id: 'user-1',
	gender: null,
	email: null,
	firstName: 'Max',
	lastName: 'Operator',
	language: null,
	street: null,
	number: null,
	city: null,
	zip: null,
	country: null,
	role: UserRole.user,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: true,
};

const portal = { actor: { type: 'user', id: 'user-1', name: 'Max Operator' }, source: 'portal' };
const webhook = { actor: { type: 'system' as const, id: 'stripe-webhook' }, source: 'system' as const };

const contribution = {
	amount: 50,
	currency: Currency.CHF,
	amountChf: 50,
	feesChf: 1,
	status: ContributionStatus.succeeded,
	contributorId: 'contributor-1',
	campaignId: 'campaign-1',
};

const record = {
	...contribution,
	id: 'contribution-1',
	contributor: { id: 'contributor-1' },
	campaign: { id: 'campaign-1' },
	createdAt: new Date('2026-10-01T00:00:00.000Z'),
	updatedAt: null,
};

describe('contribution write attribution', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Object.values(mockWriteRepository).forEach((write) => write.mockResolvedValue(record));
		mockFindPaymentEventByTransactionId.mockResolvedValue(null);
	});

	test('attributes portal writes to the session', async () => {
		await createContribution(operator, contribution);
		await updateContribution(operator, { ...contribution, id: 'contribution-1' });

		expect(mockWriteRepository.createContribution).toHaveBeenCalledWith(portal, contribution);
		expect(mockWriteRepository.updateContribution).toHaveBeenCalledWith(portal, 'contribution-1', {
			...contribution,
			id: 'contribution-1',
		});
	});

	test('creates or updates the contribution of a Stripe payment event', async () => {
		const paymentEvent = { type: PaymentEventType.stripe, transactionId: 'ch_1' };
		const data = { ...contribution, createdAt: record.createdAt };

		await upsertFromStripeEvent(webhook, data, paymentEvent);
		mockFindPaymentEventByTransactionId.mockResolvedValue({ id: 'event-1', contribution: { id: 'contribution-1' } });
		await upsertFromStripeEvent(webhook, data, paymentEvent);

		expect(mockWriteRepository.createContributionFromStripe).toHaveBeenCalledWith(webhook, data, paymentEvent);
		expect(mockWriteRepository.updateContributionFromStripe).toHaveBeenCalledWith(
			webhook,
			'contribution-1',
			data,
			paymentEvent,
		);
	});

	test('only updates pending bank transfer contributions', async () => {
		const audit = { actor: { type: 'system' as const, id: 'payment-files-import' }, source: 'system' as const };
		const input = { type: PaymentEventType.bank_transfer, transactionId: 'ref-1', contribution };

		mockFindPaymentEventByTransactionId.mockResolvedValue({
			id: 'event-1',
			contribution: { id: 'contribution-1', status: ContributionStatus.pending },
		});
		await upsertFromBankTransfer(audit, input);
		mockFindPaymentEventByTransactionId.mockResolvedValue({
			id: 'event-1',
			contribution: { id: 'contribution-1', status: ContributionStatus.succeeded },
		});
		await upsertFromBankTransfer(audit, input);

		expect(mockWriteRepository.updateContributionFromBankTransfer).toHaveBeenCalledWith(audit, 'contribution-1', input);
		expect(mockWriteRepository.createContributionFromBankTransfer).toHaveBeenCalledWith(audit, input, true);
	});
});
