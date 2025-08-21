import {
	Contribution as PrismaContribution,
	ContributionSource,
	ContributionStatus,
} from '@prisma/client';
import { contributorsData } from './contributors';
import { PROGRAM1_ID, PROGRAM2_ID, PROGRAM3_ID } from './programs';

const SOURCE = ContributionSource.stripe;
const STATUS = ContributionStatus.succeeded;
const CURRENCY = 'CHF';

let idx = 1;

const PAIRS: [string, string][] = [
	[PROGRAM1_ID, PROGRAM2_ID],
	[PROGRAM2_ID, PROGRAM3_ID],
	[PROGRAM3_ID, PROGRAM1_ID],
];

export const contributionsData: PrismaContribution[] = [];

contributorsData.forEach((c, i) => {
	const [pA, pB] = PAIRS[i % PAIRS.length];
	const base = 50 + (i % 5) * 10;
	const now = Date.now();

	contributionsData.push(
		{
			id: `contribution-${idx++}`,
			amount: base,
			amountChf: base,
			feesChf: 1,
			frequency: 'one_time',
			interval: 'one_time',
			source: SOURCE,
			status: STATUS,
			currency: CURRENCY,
			referenceId: `ref-${i + 1}-a`,
			transactionId: `tx-${i + 1}-a`,
			rawContent: null,
			contributorId: c.id,
			campaignId: null,
			programId: pA,
			createdAt: new Date(now - i * 86400000),
			updatedAt: null,
		},
		{
			id: `contribution-${idx++}`,
			amount: base + 10,
			amountChf: base + 10,
			feesChf: 1,
			frequency: 'one_time',
			interval: 'one_time',
			source: SOURCE,
			status: STATUS,
			currency: CURRENCY,
			referenceId: `ref-${i + 1}-b`,
			transactionId: `tx-${i + 1}-b`,
			rawContent: null,
			contributorId: c.id,
			campaignId: null,
			programId: pB,
			createdAt: new Date(now - (i + 1) * 86400000),
			updatedAt: null,
		}
	);
});