import { COUNTRY_CODES } from '@socialincome/shared/src/types/country';
import { LANGUAGE_CODES } from '@socialincome/shared/src/types/language';
import { USER_FIRESTORE_PATH, User, UserReferralSource } from '@socialincome/shared/src/types/user';
import { buildProperties } from 'firecms';
import { CreateDonationCertificatesAction } from '../actions/CreateDonationCertificatesAction';
import { buildContributionsCollection } from './Contributions';
import { donationCertificateCollection } from './DonationCertificate';
import { buildAuditedCollection } from './shared';

export const contributorsCollection = buildAuditedCollection<User>({
	path: USER_FIRESTORE_PATH,
	group: 'Contributors',
	icon: 'Person',
	name: 'Contributors',
	singularName: 'Contributor',
	description: 'Lists all contributors',
	textSearchEnabled: true,
	permissions: () => ({ edit: true, create: true, delete: false }),
	subcollections: [buildContributionsCollection(), donationCertificateCollection],
	Actions: CreateDonationCertificatesAction,
	properties: buildProperties<User>({
		institution: {
			name: 'Institutional',
			dataType: 'boolean',
		},
		email: {
			name: 'Email',
			validation: { required: true },
			dataType: 'string',
		},
		personal: {
			name: 'Personal Info',
			dataType: 'map',
			properties: {
				name: {
					name: 'First Name',
					dataType: 'string',
					validation: { required: true },
				},
				lastname: {
					name: 'Last Name',
					dataType: 'string',
					validation: { required: true },
				},
				gender: {
					name: 'Gender',
					dataType: 'string',
					enumValues: {
						male: 'Male',
						female: 'Female',
						other: 'Other',
						private: 'Private',
					},
				},
				phone: {
					name: 'Phone',
					dataType: 'string',
				},
				company: {
					name: 'Company',
					dataType: 'string',
				},
				referral: {
					name: 'Referral',
					dataType: 'string',
					enumValues: [
						{ id: UserReferralSource.FamilyFriends, label: 'Family or friends' },
						{ id: UserReferralSource.Work, label: 'Work colleagues' },
						{ id: UserReferralSource.SocialMedia, label: 'Social Media' },
						{ id: UserReferralSource.Media, label: 'Media' },
						{ id: UserReferralSource.Presentation, label: 'Presentation' },
						{ id: UserReferralSource.Other, label: 'Other' },
					],
				},
			},
		},
		address: {
			name: 'Address',
			dataType: 'map',
			properties: {
				country: {
					name: 'Country',
					dataType: 'string',
					validation: { required: true },
					enumValues: {
						...COUNTRY_CODES.map((code) => ({ id: code, label: code })),
					},
				},
				city: {
					name: 'City',
					dataType: 'string',
				},
				zip: {
					name: 'Zipcode',
					dataType: 'number',
				},
				street: {
					name: 'Street',
					dataType: 'string',
				},
				number: {
					name: 'House Number',
					dataType: 'string',
				},
			},
		},
		language: {
			name: 'Language',
			dataType: 'string',
			enumValues: { ...LANGUAGE_CODES.map((code) => ({ id: code, label: code })) },
		},
		currency: {
			name: 'Currency',
			dataType: 'string',
			enumValues: {
				CHF: 'CHF',
				EUR: 'EUR',
				USD: 'USD',
			},
			validation: { required: true },
		},
		auth_user_id: {
			name: 'Auth User Id',
			dataType: 'string',
			readOnly: true,
		},
		stripe_customer_id: {
			name: 'Stripe Customer',
			dataType: 'string',
			readOnly: true,
			Preview: (property) => (
				<a target="_blank" rel="noopener noreferrer" href={`https://dashboard.stripe.com/customers/${property.value}`}>
					{property.value}
				</a>
			),
		},
		payment_reference_id: {
			name: 'Swiss QR-bill payment reference id',
			dataType: 'number',
			readOnly: true,
		},
		created_at: {
			name: 'Created At',
			// @ts-ignore
			dataType: 'date',
			readOnly: true,
		},
	}),
});
