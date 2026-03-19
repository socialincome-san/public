import { PaymentInformation } from '@/generated/prisma/client';
import { recipientContactDefinitions } from './contacts.data';
import { phonesData } from './phones.data';

const createdAt = new Date('2025-01-01T13:00:00.000Z');

type PhoneId = (typeof phonesData)[number]['id'];
type RecipientKey = (typeof recipientContactDefinitions)[number]['key'];
type RecipientState = (typeof recipientContactDefinitions)[number]['state'];
type PaymentInformationKey = `${RecipientKey}-${RecipientState}`;
type PaymentInformationSeed = {
	key: PaymentInformationKey;
	phoneId: PhoneId;
};

const paymentInformationSeeds: ReadonlyArray<PaymentInformationSeed> = [
	{ key: 'core-sl-active', phoneId: 'ph-recipient-core-sl-active' },
	{ key: 'core-sl-future', phoneId: 'ph-recipient-core-sl-future' },
	{ key: 'core-sl-completed', phoneId: 'ph-recipient-core-sl-completed' },
	{ key: 'core-sl-suspended', phoneId: 'ph-recipient-core-sl-suspended' },
	{ key: 'women-sl-active', phoneId: 'ph-recipient-women-sl-active' },
	{ key: 'women-sl-future', phoneId: 'ph-recipient-women-sl-future' },
	{ key: 'women-sl-completed', phoneId: 'ph-recipient-women-sl-completed' },
	{ key: 'women-sl-suspended', phoneId: 'ph-recipient-women-sl-suspended' },
	{ key: 'education-sl-active', phoneId: 'ph-recipient-education-sl-active' },
	{ key: 'education-sl-future', phoneId: 'ph-recipient-education-sl-future' },
	{ key: 'education-sl-completed', phoneId: 'ph-recipient-education-sl-completed' },
	{ key: 'education-sl-suspended', phoneId: 'ph-recipient-education-sl-suspended' },
	{ key: 'livelihood-gh-active', phoneId: 'ph-recipient-livelihood-gh-active' },
	{ key: 'livelihood-gh-future', phoneId: 'ph-recipient-livelihood-gh-future' },
	{ key: 'livelihood-gh-completed', phoneId: 'ph-recipient-livelihood-gh-completed' },
	{ key: 'livelihood-gh-suspended', phoneId: 'ph-recipient-livelihood-gh-suspended' },
	{ key: 'education-gh-active', phoneId: 'ph-recipient-education-gh-active' },
	{ key: 'education-gh-future', phoneId: 'ph-recipient-education-gh-future' },
	{ key: 'education-gh-completed', phoneId: 'ph-recipient-education-gh-completed' },
	{ key: 'education-gh-suspended', phoneId: 'ph-recipient-education-gh-suspended' },
	{ key: 'resilience-lr-active', phoneId: 'ph-recipient-resilience-lr-active' },
	{ key: 'resilience-lr-future', phoneId: 'ph-recipient-resilience-lr-future' },
	{ key: 'resilience-lr-completed', phoneId: 'ph-recipient-resilience-lr-completed' },
	{ key: 'resilience-lr-suspended', phoneId: 'ph-recipient-resilience-lr-suspended' },
	{ key: 'health-lr-active', phoneId: 'ph-recipient-health-lr-active' },
	{ key: 'health-lr-future', phoneId: 'ph-recipient-health-lr-future' },
	{ key: 'health-lr-completed', phoneId: 'ph-recipient-health-lr-completed' },
	{ key: 'health-lr-suspended', phoneId: 'ph-recipient-health-lr-suspended' },
	{ key: 'somaha-lr-active', phoneId: 'ph-recipient-somaha-lr-active' },
	{ key: 'somaha-lr-future', phoneId: 'ph-recipient-somaha-lr-future' },
	{ key: 'somaha-lr-completed', phoneId: 'ph-recipient-somaha-lr-completed' },
	{ key: 'somaha-lr-suspended', phoneId: 'ph-recipient-somaha-lr-suspended' },
];

export const paymentInformationsData: PaymentInformation[] = paymentInformationSeeds.map(({ key, phoneId }) => ({
	id: `payment-information-${key}`,
	mobileMoneyProviderId: 'mobile-money-provider-id-1',
	code: `PI-${key.toUpperCase().replaceAll('-', '_')}`,
	phoneId,
	createdAt,
	updatedAt: null,
}));
