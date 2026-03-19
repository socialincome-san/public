import { Recipient } from '@/generated/prisma/client';
import { candidateContactDefinitions, recipientContactDefinitions } from './contacts.data';
import { localPartnersData } from './local-partners.data';
import { paymentInformationsData } from './payment-information.data';
import { programsData } from './programs.data';

const createdAt = new Date('2025-01-01T13:00:00.000Z');

type ProgramId = (typeof programsData)[number]['id'];
type LocalPartnerId = (typeof localPartnersData)[number]['id'];
type PaymentInformationId = (typeof paymentInformationsData)[number]['id'];
type RecipientKey = (typeof recipientContactDefinitions)[number]['key'];
type RecipientState = (typeof recipientContactDefinitions)[number]['state'];
type CandidateKey = (typeof candidateContactDefinitions)[number]['key'];

const programAndPartnerByKey: Record<RecipientKey, { programId: ProgramId; localPartnerId: LocalPartnerId }> = {
	'core-sl': { programId: 'program-si-core-sl', localPartnerId: 'local-partner-sl-1' },
	'women-sl': { programId: 'program-si-women-support-sl', localPartnerId: 'local-partner-sl-1' },
	'education-sl': { programId: 'program-si-education-sl', localPartnerId: 'local-partner-sl-1' },
	'livelihood-gh': { programId: 'program-si-livelihood-gh', localPartnerId: 'local-partner-gh-1' },
	'education-gh': { programId: 'program-si-education-gh', localPartnerId: 'local-partner-gh-1' },
	'resilience-lr': { programId: 'program-si-resilience-lr', localPartnerId: 'local-partner-lr-1' },
	'health-lr': { programId: 'program-si-health-lr', localPartnerId: 'local-partner-lr-1' },
	'somaha-lr': { programId: 'program-somaha-community-lr', localPartnerId: 'local-partner-somaha-1' },
};

const paymentInformationIdByKeyAndState: Record<RecipientKey, Record<RecipientState, PaymentInformationId>> = {
	'core-sl': {
		active: 'payment-information-core-sl-active',
		future: 'payment-information-core-sl-future',
		completed: 'payment-information-core-sl-completed',
		suspended: 'payment-information-core-sl-suspended',
	},
	'women-sl': {
		active: 'payment-information-women-sl-active',
		future: 'payment-information-women-sl-future',
		completed: 'payment-information-women-sl-completed',
		suspended: 'payment-information-women-sl-suspended',
	},
	'education-sl': {
		active: 'payment-information-education-sl-active',
		future: 'payment-information-education-sl-future',
		completed: 'payment-information-education-sl-completed',
		suspended: 'payment-information-education-sl-suspended',
	},
	'livelihood-gh': {
		active: 'payment-information-livelihood-gh-active',
		future: 'payment-information-livelihood-gh-future',
		completed: 'payment-information-livelihood-gh-completed',
		suspended: 'payment-information-livelihood-gh-suspended',
	},
	'education-gh': {
		active: 'payment-information-education-gh-active',
		future: 'payment-information-education-gh-future',
		completed: 'payment-information-education-gh-completed',
		suspended: 'payment-information-education-gh-suspended',
	},
	'resilience-lr': {
		active: 'payment-information-resilience-lr-active',
		future: 'payment-information-resilience-lr-future',
		completed: 'payment-information-resilience-lr-completed',
		suspended: 'payment-information-resilience-lr-suspended',
	},
	'health-lr': {
		active: 'payment-information-health-lr-active',
		future: 'payment-information-health-lr-future',
		completed: 'payment-information-health-lr-completed',
		suspended: 'payment-information-health-lr-suspended',
	},
	'somaha-lr': {
		active: 'payment-information-somaha-lr-active',
		future: 'payment-information-somaha-lr-future',
		completed: 'payment-information-somaha-lr-completed',
		suspended: 'payment-information-somaha-lr-suspended',
	},
};

const statusStartDates: Record<RecipientState, Date> = {
	active: new Date('2024-10-01T00:00:00.000Z'),
	future: new Date('2025-04-01T00:00:00.000Z'),
	completed: new Date('2023-10-01T00:00:00.000Z'),
	suspended: new Date('2024-07-01T00:00:00.000Z'),
};

const programRecipientsData: Recipient[] = recipientContactDefinitions.map(({ key, state, contactId }) => ({
	id: `recipient-${key}-${state}`,
	legacyFirestoreId: null,
	contactId,
	startDate: statusStartDates[state],
	suspendedAt: state === 'suspended' ? new Date('2024-12-01T00:00:00.000Z') : null,
	suspensionReason: state === 'suspended' ? `suspension_${key}_${state}` : null,
	successorName: null,
	termsAccepted: state !== 'future',
	paymentInformationId: paymentInformationIdByKeyAndState[key][state],
	programId: programAndPartnerByKey[key].programId,
	localPartnerId: programAndPartnerByKey[key].localPartnerId,
	createdAt,
	updatedAt: null,
}));

const candidateLocalPartnerByKey: Record<CandidateKey, LocalPartnerId> = {
	'sl-1': 'local-partner-sl-1',
	'sl-2': 'local-partner-sl-1',
	'lr-1': 'local-partner-lr-1',
	'lr-2': 'local-partner-lr-1',
};

const candidatesData: Recipient[] = candidateContactDefinitions.map(({ key, contactId }) => ({
	id: `candidate-${key}`,
	legacyFirestoreId: null,
	contactId,
	startDate: null,
	suspendedAt: null,
	suspensionReason: null,
	successorName: null,
	termsAccepted: false,
	paymentInformationId: null,
	programId: null,
	localPartnerId: candidateLocalPartnerByKey[key],
	createdAt,
	updatedAt: null,
}));

export const recipientsData: Recipient[] = [...programRecipientsData, ...candidatesData];
