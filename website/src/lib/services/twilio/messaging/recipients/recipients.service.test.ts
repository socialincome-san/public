import type { PrismaClient } from '@/generated/prisma/client';
import type { ContributorReadService } from '../../../contributor/contributor-read.service';
import type { LocalPartnerReadService } from '../../../local-partner/local-partner-read.service';
import type { RecipientReadService } from '../../../recipient/recipient-read.service';
import { MessagingRecipientsService } from './recipients.service';
import type { MessagingRecipientFilters } from './recipients.types';
import type { SelectionState } from './selection.types';

const contactPhone = { number: '+41791111111', hasWhatsApp: true };
const paymentPhone = { number: '+41792222222', hasWhatsApp: false };

type Rows = {
	recipient?: unknown[];
	contributor?: unknown[];
	localPartner?: unknown[];
};

type TableView = { tableRows: { id: string }[]; totalCount: number };

const tableViewRead = (result: { success: true; data: TableView } | { success: false; error: string }) => ({
	getPaginatedTableView: jest.fn().mockResolvedValue(result),
});

const tableViewOk = (ids: string[]) =>
	tableViewRead({ success: true, data: { tableRows: ids.map((id) => ({ id })), totalCount: ids.length } });

type Reads = {
	contributorRead?: ReturnType<typeof tableViewRead>;
	recipientRead?: ReturnType<typeof tableViewRead>;
	localPartnerRead?: ReturnType<typeof tableViewRead>;
};

function makeService(rows: Rows, reads: Reads = {}) {
	const db = {
		recipient: { findMany: jest.fn().mockResolvedValue(rows.recipient ?? []) },
		contributor: { findMany: jest.fn().mockResolvedValue(rows.contributor ?? []) },
		localPartner: { findMany: jest.fn().mockResolvedValue(rows.localPartner ?? []) },
	};
	const service = new MessagingRecipientsService(
		db as unknown as PrismaClient,
		(reads.contributorRead ?? {}) as unknown as ContributorReadService,
		(reads.recipientRead ?? {}) as unknown as RecipientReadService,
		(reads.localPartnerRead ?? {}) as unknown as LocalPartnerReadService,
	);

	return { service, db };
}

const allMatching = (filters: MessagingRecipientFilters = {}): SelectionState => ({
	mode: 'all-matching',
	search: 'ann',
	filters,
	excludedIds: new Set<string>(),
});

describe('MessagingRecipientsService.translateEntityIdsToTargets', () => {
	test('recipient with contact source: targets the contact phone', async () => {
		const { service } = makeService({
			recipient: [{ contactId: 'ct1', contact: { phone: contactPhone }, paymentInformation: { phone: paymentPhone } }],
		});

		const targets = await service.translateEntityIdsToTargets('recipient', ['r1'], 'contact', false);

		expect(targets).toEqual([{ contactId: 'ct1', phone: contactPhone }]);
	});

	test('recipient with payment source: targets the payment phone', async () => {
		const { service } = makeService({
			recipient: [{ contactId: 'ct1', contact: { phone: contactPhone }, paymentInformation: { phone: paymentPhone } }],
		});

		const targets = await service.translateEntityIdsToTargets('recipient', ['r1'], 'payment', false);

		expect(targets).toEqual([{ contactId: 'ct1', phone: paymentPhone }]);
	});

	test('recipient without payment information, payment source, no fallback: no phone', async () => {
		const { service } = makeService({
			recipient: [{ contactId: 'ct1', contact: { phone: contactPhone }, paymentInformation: null }],
		});

		const targets = await service.translateEntityIdsToTargets('recipient', ['r1'], 'payment', false);

		expect(targets).toEqual([{ contactId: 'ct1', phone: null }]);
	});

	test('recipient without payment phone, payment source, fallback on: uses the contact phone', async () => {
		const { service } = makeService({
			recipient: [{ contactId: 'ct1', contact: { phone: contactPhone }, paymentInformation: { phone: null } }],
		});

		const targets = await service.translateEntityIdsToTargets('recipient', ['r1'], 'payment', true);

		expect(targets).toEqual([{ contactId: 'ct1', phone: contactPhone }]);
	});

	test('recipient rows are looked up by the given entity ids', async () => {
		const { service, db } = makeService({ recipient: [] });

		await service.translateEntityIdsToTargets('recipient', ['r1', 'r2'], 'contact', false);

		expect(db.recipient.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { in: ['r1', 'r2'] } } }));
	});

	test('contributor: targets the contact phone', async () => {
		const { service } = makeService({ contributor: [{ contactId: 'ct2', contact: { phone: contactPhone } }] });

		const targets = await service.translateEntityIdsToTargets('contributor', ['co1'], 'contact', false);

		expect(targets).toEqual([{ contactId: 'ct2', phone: contactPhone }]);
	});

	test('local partner: targets the contact phone', async () => {
		const { service } = makeService({ localPartner: [{ contactId: 'ct3', contact: { phone: null } }] });

		const targets = await service.translateEntityIdsToTargets('local-partner', ['lp1'], 'contact', false);

		expect(targets).toEqual([{ contactId: 'ct3', phone: null }]);
	});

	test('no entity ids: returns nothing and does not query', async () => {
		const { service, db } = makeService({});

		const targets = await service.translateEntityIdsToTargets('recipient', [], 'contact', false);

		expect(targets).toEqual([]);
		expect(db.recipient.findMany).not.toHaveBeenCalled();
	});
});

describe('MessagingRecipientsService.resolveTargets', () => {
	test('include selection resolves the selected recipients to targets', async () => {
		const { service } = makeService({
			recipient: [{ contactId: 'ct1', contact: { phone: contactPhone }, paymentInformation: { phone: paymentPhone } }],
		});

		const targets = await service.resolveTargets(
			'recipient',
			{ mode: 'include', ids: new Set(['r1']) },
			'payment',
			false,
			'user1',
		);

		expect(targets).toEqual([{ contactId: 'ct1', phone: paymentPhone }]);
	});
});

describe('MessagingRecipientsService.resolveTargets (all matching)', () => {
	test('recipient: pages through the recipient table view with program and status filters', async () => {
		const recipientRead = tableViewOk(['r1']);
		const { service } = makeService(
			{ recipient: [{ contactId: 'ct1', contact: { phone: contactPhone }, paymentInformation: null }] },
			{ recipientRead },
		);

		const targets = await service.resolveTargets(
			'recipient',
			allMatching({ programId: 'p1', recipientStatus: 'active' }),
			'contact',
			false,
			'user1',
		);

		expect(recipientRead.getPaginatedTableView).toHaveBeenCalledWith('user1', {
			page: 1,
			pageSize: 200,
			search: 'ann',
			programId: 'p1',
			recipientStatus: 'active',
		});
		expect(targets).toEqual([{ contactId: 'ct1', phone: contactPhone }]);
	});

	test('contributor: pages through the contributor table view with the country filter', async () => {
		const contributorRead = tableViewOk(['co1']);
		const { service } = makeService(
			{ contributor: [{ contactId: 'ct2', contact: { phone: contactPhone } }] },
			{ contributorRead },
		);

		const targets = await service.resolveTargets('contributor', allMatching({ country: 'CH' }), 'contact', false, 'user1');

		expect(contributorRead.getPaginatedTableView).toHaveBeenCalledWith('user1', {
			page: 1,
			pageSize: 200,
			search: 'ann',
			country: 'CH',
		});
		expect(targets).toEqual([{ contactId: 'ct2', phone: contactPhone }]);
	});

	test('local partner: pages through the local partner table view without filters', async () => {
		const localPartnerRead = tableViewOk(['lp1']);
		const { service } = makeService(
			{ localPartner: [{ contactId: 'ct3', contact: { phone: contactPhone } }] },
			{ localPartnerRead },
		);

		const targets = await service.resolveTargets('local-partner', allMatching(), 'contact', false, 'user1');

		expect(localPartnerRead.getPaginatedTableView).toHaveBeenCalledWith('user1', { page: 1, pageSize: 200, search: 'ann' });
		expect(targets).toEqual([{ contactId: 'ct3', phone: contactPhone }]);
	});

	test('a failing table view surfaces its error', async () => {
		const recipientRead = tableViewRead({ success: false, error: 'Permission denied' });
		const { service } = makeService({}, { recipientRead });

		await expect(service.resolveTargets('recipient', allMatching(), 'contact', false, 'user1')).rejects.toThrow(
			'Permission denied',
		);
	});
});
