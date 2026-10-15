const mockIsAdmin = jest.fn();
const mockFindAuditEventPage = jest.fn();
const mockFindAuditEventHistory = jest.fn();
const mockGetRecipientById = jest.fn();
const mockGetAccessiblePrograms = jest.fn();
const mockGetCampaignFilterOption = jest.fn();
const mockGetCandidate = jest.fn();

jest.mock('@/modules/users/user.service', () => ({ isAdmin: mockIsAdmin, getUser: jest.fn() }));
jest.mock('@/modules/recipients/recipient.service', () => ({ getRecipientById: mockGetRecipientById }));
jest.mock('@/modules/program-access/program-access.service', () => ({ getAccessiblePrograms: mockGetAccessiblePrograms }));
jest.mock('@/modules/campaigns/campaign.service', () => ({ getCampaignFilterOption: mockGetCampaignFilterOption }));
jest.mock('@/modules/candidates/candidate.service', () => ({ getCandidate: mockGetCandidate }));
jest.mock('@/modules/contributions/contribution.service', () => ({ getContribution: jest.fn() }));
jest.mock('@/modules/contributors/contributor.service', () => ({ getContributor: jest.fn() }));
jest.mock('@/modules/countries/country.service', () => ({ getCountry: jest.fn() }));
jest.mock('@/modules/expenses/expense.service', () => ({ getExpense: jest.fn() }));
jest.mock('@/modules/focuses/focus.service', () => ({ getFocus: jest.fn() }));
jest.mock('@/modules/local-partners/local-partner.service', () => ({ getLocalPartner: jest.fn() }));
jest.mock('@/modules/mobile-money-providers/mobile-money-provider.service', () => ({ getMobileMoneyProvider: jest.fn() }));
jest.mock('@/modules/organizations/organization.service', () => ({ getOrganization: jest.fn() }));
jest.mock('@/modules/payouts/payout.service', () => ({ getPayout: jest.fn() }));
jest.mock('@/modules/programs/program.service', () => ({ getProgramSettings: jest.fn() }));
jest.mock('@/modules/surveys/survey.service', () => ({ getSurvey: jest.fn() }));
jest.mock('./audit.repository', () => ({
	findAuditEventPage: mockFindAuditEventPage,
	findAuditEventHistory: mockFindAuditEventHistory,
}));

import type { UserSession } from '@/modules/users/user.types';
import { getAuditTableView, getEntityAuditTableView } from './audit.service';

const event = (id: string, action: string, snapshot: object | null, entityName: string | null) => ({
	id,
	entityType: 'recipient',
	entityId: 'recipient-1',
	entityName,
	action,
	actorType: 'user',
	actorName: 'Max Operator',
	source: 'portal',
	snapshot,
	createdAt: new Date('2026-10-01T00:00:00.000Z'),
});

const query = { page: 1, pageSize: 10, search: '' };

describe('getAuditTableView', () => {
	const history = [
		event('v1', 'create', { paymentInformation: { phone: { number: '+232111' } } }, 'Ada Lovelace'),
		event('v2', 'update', { paymentInformation: { phone: { number: '+232222' } } }, 'Ada King'),
		event('v3', 'delete', null, null),
	];

	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindAuditEventPage.mockResolvedValue({ events: [history[1]], totalCount: 3 });
		mockFindAuditEventHistory.mockResolvedValue(history);
	});

	test('is only available to admins', async () => {
		mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });

		await expect(getAuditTableView('user-1', query)).resolves.toMatchObject({ success: false });
		expect(mockFindAuditEventPage).not.toHaveBeenCalled();
	});

	test('pages, filters and searches in the database', async () => {
		await getAuditTableView('user-1', { ...query, page: 2, search: ' max ', entityType: 'recipient' });

		expect(mockFindAuditEventPage).toHaveBeenCalledWith({ entityType: 'recipient', search: 'max', skip: 10, take: 10 });
		expect(mockFindAuditEventHistory).toHaveBeenCalledWith([{ entityType: 'recipient', entityId: 'recipient-1' }]);
	});

	test('diffs each row against the previous event and keeps the latest name of deleted entities', async () => {
		await expect(getAuditTableView('user-1', query)).resolves.toMatchObject({
			success: true,
			data: {
				totalCount: 3,
				tableRows: [
					{
						id: 'v2',
						entityType: 'recipient',
						entityId: 'recipient-1',
						entityName: 'Ada King',
						actorName: 'Max Operator',
						changes: [{ path: 'paymentInformation.phone.number', old: '+232111', new: '+232222' }],
					},
				],
			},
		});
	});
});

describe('getEntityAuditTableView', () => {
	const session = { id: 'user-1' } as UserSession;
	const history = [
		event('v1', 'create', { firstName: 'Ada' }, 'Ada'),
		event('v2', 'update', { firstName: 'Ada', lastName: 'King' }, 'Ada King'),
		event('v3', 'update', { firstName: 'Augusta', lastName: 'King' }, 'Augusta King'),
	];
	const entityQuery = { ...query, pageSize: 2, entityType: 'recipient' as const, entityId: 'recipient-1' };

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetRecipientById.mockResolvedValue({ success: true, data: {} });
		mockGetCandidate.mockResolvedValue({ success: false, error: 'Not a candidate' });
		mockFindAuditEventHistory.mockResolvedValue(history);
	});

	test('is only available to those who may read the entity', async () => {
		mockGetRecipientById.mockResolvedValue({ success: false, error: 'Permission denied' });

		await expect(getEntityAuditTableView(session, entityQuery)).resolves.toEqual({
			success: false,
			error: 'Permission denied',
		});
		expect(mockGetRecipientById).toHaveBeenCalledWith(session, 'recipient-1');
		expect(mockFindAuditEventHistory).not.toHaveBeenCalled();
	});

	test('shows candidates to those who may read the candidate', async () => {
		mockGetRecipientById.mockResolvedValue({ success: false, error: 'Permission denied' });
		mockGetCandidate.mockResolvedValue({ success: true, data: {} });

		await expect(getEntityAuditTableView(session, entityQuery)).resolves.toMatchObject({ success: true });
		expect(mockGetCandidate).toHaveBeenCalledWith(session, 'recipient-1');
	});

	test('pages the history newest first, each row diffed against the previous event', async () => {
		const result = await getEntityAuditTableView(session, entityQuery);

		expect(mockFindAuditEventHistory).toHaveBeenCalledWith([{ entityType: 'recipient', entityId: 'recipient-1' }]);
		expect(result).toMatchObject({
			success: true,
			data: {
				totalCount: 3,
				tableRows: [
					{ id: 'v3', entityName: 'Augusta King', changes: [{ path: 'firstName', old: 'Ada', new: 'Augusta' }] },
					{ id: 'v2', changes: [{ path: 'lastName', old: null, new: 'King' }] },
				],
			},
		});
		await expect(getEntityAuditTableView(session, { ...entityQuery, page: 2 })).resolves.toMatchObject({
			data: { tableRows: [{ id: 'v1' }] },
		});
	});

	test('lists no baseline, but diffs the first change against it', async () => {
		mockFindAuditEventHistory.mockResolvedValue([
			event('v0', 'baseline', { firstName: 'Ada' }, 'Ada'),
			event('v1', 'update', { firstName: 'Augusta' }, 'Augusta'),
		]);

		await expect(getEntityAuditTableView(session, entityQuery)).resolves.toMatchObject({
			success: true,
			data: {
				totalCount: 1,
				tableRows: [{ id: 'v1', changes: [{ path: 'firstName', old: 'Ada', new: 'Augusta' }] }],
			},
		});
	});

	test('shows campaigns only to operators of their program', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [
				{ programId: 'program-1', permission: 'operator' },
				{ programId: 'program-2', permission: 'owner' },
			],
		});
		mockGetCampaignFilterOption.mockResolvedValue({ success: true, data: null });

		await expect(
			getEntityAuditTableView(session, { ...entityQuery, entityType: 'campaign', entityId: 'campaign-1' }),
		).resolves.toMatchObject({ success: false });
		expect(mockGetCampaignFilterOption).toHaveBeenCalledWith('campaign-1', ['program-1']);
		expect(mockFindAuditEventHistory).not.toHaveBeenCalled();
	});
});
