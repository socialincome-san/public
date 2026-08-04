import { Address, Contact, Gender, PaymentInformation, Phone, Recipient } from '@/generated/prisma/client';
import { LanguageCode } from '@/lib/types/language';
import { programsData } from './programs.data';

const createdAt = new Date('2025-01-01T13:00:00.000Z');
const EXTRA_ACTIVE_RECIPIENTS_PER_PROGRAM = 5;

type SeedCountry = 'sl' | 'gh' | 'lr';

type ProgramRecipientSeedMeta = {
	key: string;
	country: SeedCountry;
	localPartnerId: string;
	mobileMoneyProviderId: string;
	phonePrefix: string;
	language: LanguageCode;
	city: string;
	addressCountry: Address['country'];
	zip: string;
};

/**
 * One row per program in programsData. Adding a program without an entry here fails at seed load.
 */
const programRecipientMetaByProgramId = {
	'program-si-core-sl': {
		key: 'core-sl',
		country: 'sl',
		localPartnerId: 'local-partner-sl-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-3',
		phonePrefix: '+23232000',
		language: 'kri',
		city: 'Freetown',
		addressCountry: 'SL',
		zip: '1000',
	},
	'program-si-women-support-sl': {
		key: 'women-sl',
		country: 'sl',
		localPartnerId: 'local-partner-sl-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-3',
		phonePrefix: '+23232001',
		language: 'kri',
		city: 'Bo',
		addressCountry: 'SL',
		zip: '2000',
	},
	'program-si-education-sl': {
		key: 'education-sl',
		country: 'sl',
		localPartnerId: 'local-partner-sl-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-3',
		phonePrefix: '+23232002',
		language: 'kri',
		city: 'Kenema',
		addressCountry: 'SL',
		zip: '3000',
	},
	'program-si-livelihood-gh': {
		key: 'livelihood-gh',
		country: 'gh',
		localPartnerId: 'local-partner-gh-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-5',
		phonePrefix: '+23324200',
		language: 'en',
		city: 'Accra',
		addressCountry: 'GH',
		zip: 'GA-100',
	},
	'program-si-education-gh': {
		key: 'education-gh',
		country: 'gh',
		localPartnerId: 'local-partner-gh-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-7',
		phonePrefix: '+23324201',
		language: 'en',
		city: 'Kumasi',
		addressCountry: 'GH',
		zip: 'AK-100',
	},
	'program-si-resilience-lr': {
		key: 'resilience-lr',
		country: 'lr',
		localPartnerId: 'local-partner-lr-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-4',
		phonePrefix: '+23177200',
		language: 'en',
		city: 'Monrovia',
		addressCountry: 'LR',
		zip: '1000',
	},
	'program-si-health-lr': {
		key: 'health-lr',
		country: 'lr',
		localPartnerId: 'local-partner-lr-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-4',
		phonePrefix: '+23177201',
		language: 'en',
		city: 'Gbarnga',
		addressCountry: 'LR',
		zip: '1200',
	},
	'program-somaha-community-lr': {
		key: 'somaha-lr',
		country: 'lr',
		localPartnerId: 'local-partner-somaha-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-4',
		phonePrefix: '+23177202',
		language: 'en',
		city: 'Buchanan',
		addressCountry: 'LR',
		zip: '1300',
	},
	'program-mother-and-newborn': {
		key: 'mother-newborn-sl',
		country: 'sl',
		localPartnerId: 'local-partner-sl-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-3',
		phonePrefix: '+23232003',
		language: 'kri',
		city: 'Makeni',
		addressCountry: 'SL',
		zip: '4000',
	},
	'program-widow': {
		key: 'widow-sl',
		country: 'sl',
		localPartnerId: 'local-partner-sl-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-3',
		phonePrefix: '+23232004',
		language: 'kri',
		city: 'Koidu',
		addressCountry: 'SL',
		zip: '5000',
	},
	'program-gender-based-violence': {
		key: 'gbv-sl',
		country: 'sl',
		localPartnerId: 'local-partner-sl-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-3',
		phonePrefix: '+23232005',
		language: 'kri',
		city: 'Freetown',
		addressCountry: 'SL',
		zip: '1000',
	},
	'program-ebola-survivors': {
		key: 'ebola-sl',
		country: 'sl',
		localPartnerId: 'local-partner-sl-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-3',
		phonePrefix: '+23232006',
		language: 'kri',
		city: 'Bo',
		addressCountry: 'SL',
		zip: '2000',
	},
	'program-ubi-for-artists': {
		key: 'ubi-artists-gh',
		country: 'gh',
		localPartnerId: 'local-partner-gh-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-5',
		phonePrefix: '+23324202',
		language: 'en',
		city: 'Accra',
		addressCountry: 'GH',
		zip: 'GA-100',
	},
	'program-island-income': {
		key: 'island-income-lr',
		country: 'lr',
		localPartnerId: 'local-partner-lr-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-4',
		phonePrefix: '+23177203',
		language: 'en',
		city: 'Monrovia',
		addressCountry: 'LR',
		zip: '1000',
	},
} as const satisfies Record<(typeof programsData)[number]['id'], ProgramRecipientSeedMeta>;

type SeedProgramId = keyof typeof programRecipientMetaByProgramId;

const isSeedProgramId = (programId: string): programId is SeedProgramId => programId in programRecipientMetaByProgramId;

const missingProgramIds = programsData.map(({ id }) => id).filter((id) => !isSeedProgramId(id));

if (missingProgramIds.length > 0) {
	throw new Error(
		`Missing program recipient seed meta for program ids: ${missingProgramIds.join(', ')}. Add entries in program-recipient-extras.data.ts.`,
	);
}

type ExtraProgramRecipientDefinition = {
	programId: SeedProgramId;
	meta: ProgramRecipientSeedMeta;
	index: number;
	phoneId: string;
	contactId: string;
	addressId: string;
	paymentInformationId: string;
	recipientId: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	paymentCode: string | null;
};

export const extraProgramRecipientDefinitions: readonly ExtraProgramRecipientDefinition[] = programsData.flatMap(
	(program) => {
		const programId = program.id;
		if (!isSeedProgramId(programId)) {
			throw new Error(`Missing program recipient seed meta for program id: ${programId}`);
		}

		const meta: ProgramRecipientSeedMeta = programRecipientMetaByProgramId[programId];

		return Array.from({ length: EXTRA_ACTIVE_RECIPIENTS_PER_PROGRAM }, (_, offset) => {
			const index = offset + 1;
			const suffix = `extra-${index}`;
			const phoneIndex = String(index).padStart(3, '0');

			return {
				programId,
				meta,
				index,
				phoneId: `ph-recipient-${meta.key}-${suffix}`,
				contactId: `ct-recipient-${meta.key}-${suffix}`,
				addressId: `ad-recipient-${meta.key}-${suffix}`,
				paymentInformationId: `payment-information-${meta.key}-${suffix}`,
				recipientId: `recipient-${meta.key}-${suffix}`,
				firstName: `recipient_${meta.country}_${meta.key.replaceAll('-', '_')}_${suffix}`,
				lastName: `recipient_active`,
				phoneNumber: `${meta.phonePrefix}${phoneIndex}`,
				// Ghana seed payment info often omits codes; other countries set deterministic ones.
				paymentCode:
					meta.country === 'gh'
						? null
						: `PI-${meta.key.toUpperCase().replaceAll('-', '_')}_${suffix.toUpperCase().replaceAll('-', '_')}`,
			} satisfies ExtraProgramRecipientDefinition;
		});
	},
);

export const extraProgramRecipientPhonesData: Phone[] = extraProgramRecipientDefinitions.map(({ phoneId, phoneNumber }) => ({
	id: phoneId,
	number: phoneNumber,
	hasWhatsApp: true,
	createdAt,
	updatedAt: null,
}));

export const extraProgramRecipientAddressesData: Address[] = extraProgramRecipientDefinitions.map(
	({ addressId, meta, index }) => ({
		id: addressId,
		street: `recipient_${meta.country}_${meta.key}_extra_street`,
		number: `${300 + index}`,
		city: meta.city,
		zip: meta.zip,
		country: meta.addressCountry,
		createdAt,
		updatedAt: null,
	}),
);

export const extraProgramRecipientContactsData: Contact[] = extraProgramRecipientDefinitions.map(
	({ contactId, addressId, phoneId, firstName, lastName, meta, index }, definitionIndex) => ({
		id: contactId,
		firstName,
		lastName,
		callingName: firstName,
		addressId,
		phoneId,
		email: `${firstName}@recipient.test`,
		gender: definitionIndex % 2 === 0 ? Gender.female : Gender.male,
		language: meta.language,
		dateOfBirth:
			index % 4 === 1
				? new Date('2004-06-15')
				: index % 4 === 2
					? new Date('1996-06-15')
					: index % 4 === 3
						? new Date('1980-06-15')
						: new Date('1962-06-15'),
		profession: `recipient_${meta.country}_${meta.key}`,
		isInstitution: false,
		createdAt,
		updatedAt: null,
	}),
);

export const extraProgramRecipientPaymentInformationsData: PaymentInformation[] = extraProgramRecipientDefinitions.map(
	({ paymentInformationId, meta, phoneId, paymentCode }) => ({
		id: paymentInformationId,
		mobileMoneyProviderId: meta.mobileMoneyProviderId,
		code: paymentCode,
		phoneId,
		createdAt,
		updatedAt: null,
	}),
);

export const extraProgramRecipientsData: Recipient[] = extraProgramRecipientDefinitions.map(
	({ recipientId, contactId, programId, meta, paymentInformationId, index }) => ({
		id: recipientId,
		legacyFirestoreId: null,
		contactId,
		// Stagger start dates slightly so extra actives are not identical.
		startDate: new Date(Date.UTC(2024, 9, Math.min(index, 28))),
		suspendedAt: null,
		suspensionReason: null,
		successorName: null,
		termsAccepted: true,
		paymentInformationId,
		programId,
		localPartnerId: meta.localPartnerId,
		createdAt,
		updatedAt: null,
	}),
);
