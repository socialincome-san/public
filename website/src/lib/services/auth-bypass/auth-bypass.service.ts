import { RecipientWithPaymentInfo } from '@/lib/services/recipient/recipient.types';
import { PaymentProvider, Prisma, RecipientStatus } from '@prisma/client';
import { NextRequest } from 'next/server';
import { BaseService } from '../core/base.service';

export class AuthBypassService extends BaseService {
	private readonly phone = process.env.AUTH_BYPASS_PHONE;
	private readonly otp = process.env.AUTH_BYPASS_OTP;
	private readonly uid = process.env.AUTH_BYPASS_UID;
	private readonly token = process.env.AUTH_BYPASS_TOKEN;

	isFullyConfigured() {
		return !!this.phone && !!this.otp && !!this.uid && !!this.token;
	}

	matchesAuthorizationHeader(request: NextRequest) {
		if (!this.isFullyConfigured()) {
			return false;
		}

		const auth = request.headers.get('authorization');

		if (!auth) {
			return false;
		}

		return auth.includes(this.uid!);
	}

	matchesPhoneNumber(phoneNumber: string) {
		if (!this.isFullyConfigured()) {
			return false;
		}

		return phoneNumber === this.phone;
	}

	matchesOtpCredentials(phoneNumber: string, otp: string) {
		if (!this.isFullyConfigured()) {
			return false;
		}

		return phoneNumber === this.phone && otp === this.otp;
	}

	createTestLoginResult() {
		if (!this.isFullyConfigured()) {
			return this.resultFail('auth-bypass-not-configured');
		}

		return this.resultOk({
			customToken: this.token!,
			isNewUser: false,
			uid: this.uid!,
		});
	}

	createTestRecipient() {
		if (!this.isFullyConfigured()) {
			return this.resultFail('auth-bypass-not-configured');
		}

		const now = new Date();

		const testRecipient: RecipientWithPaymentInfo = {
			id: 'AUTH_BYPASS_RECIPIENT',
			legacyFirestoreId: null,
			contactId: 'AUTH_BYPASS_CONTACT',
			startDate: null,
			status: RecipientStatus.active,
			successorName: null,
			termsAccepted: true,
			paymentInformationId: 'AUTH_BYPASS_PAYMENT',
			programId: 'AUTH_BYPASS_PROGRAM',
			localPartnerId: 'AUTH_BYPASS_PARTNER',
			createdAt: now,
			updatedAt: now,
			contact: {
				id: 'AUTH_BYPASS_CONTACT',
				firstName: 'Test',
				lastName: 'User',
				callingName: 'Tester',
				addressId: null,
				phoneId: 'AUTH_BYPASS_PHONE',
				email: null,
				gender: 'other',
				language: 'en',
				dateOfBirth: null,
				profession: null,
				isInstitution: false,
				createdAt: now,
				updatedAt: now,
				phone: {
					id: 'AUTH_BYPASS_PHONE',
					number: this.phone!,
					hasWhatsApp: false,
					createdAt: now,
					updatedAt: now,
				},
			},
			localPartner: {
				id: 'AUTH_BYPASS_PARTNER',
				legacyFirestoreId: null,
				name: 'Test Partner',
				causes: [],
				contactId: 'AUTH_BYPASS_PARTNER_CONTACT',
				createdAt: now,
				updatedAt: now,
			},
			program: {
				id: 'AUTH_BYPASS_PROGRAM',
				name: 'Test Program',
				amountOfRecipientsForStart: null,
				programDurationInMonths: 12,
				payoutPerInterval: new Prisma.Decimal(0),
				payoutCurrency: 'CHF',
				payoutInterval: 'monthly',
				targetCauses: [],
				countryId: 'AUTH_BYPASS_COUNTRY',
				createdAt: now,
				updatedAt: now,
			},
			paymentInformation: {
				id: 'AUTH_BYPASS_PAYMENT',
				provider: PaymentProvider.orange_money,
				code: 'AUTH-BYPASS-CODE',
				phoneId: 'AUTH_BYPASS_PHONE',
				createdAt: now,
				updatedAt: now,
				phone: {
					id: 'AUTH_BYPASS_PHONE',
					number: this.phone!,
					hasWhatsApp: false,
					createdAt: now,
					updatedAt: now,
				},
			},
		};

		return this.resultOk(testRecipient);
	}
}
