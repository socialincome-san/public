import { Gender, PaymentProvider, PayoutInterval, Prisma, RecipientStatus } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { RecipientWithPaymentInfo } from '../recipient/recipient.types';

export class AppReviewModeService extends BaseService {
	isEnabled(): boolean {
		return process.env.APP_REVIEW_MODE_ENABLED === 'true';
	}

	isReviewPhone(phone: string): boolean {
		const reviewPhone = process.env.APP_REVIEW_PHONE_NUMBER;
		if (!reviewPhone) {
			return false;
		}
		return phone === reviewPhone || `+${phone}` === reviewPhone;
	}

	shouldBypass(phone: string): boolean {
		return this.isEnabled() && this.isReviewPhone(phone);
	}

	getMockRecipient(phone: string): ServiceResult<RecipientWithPaymentInfo> {
		if (!this.shouldBypass(phone)) {
			return this.resultFail('App review mode not active for this phone');
		}

		const recipient: RecipientWithPaymentInfo = {
			id: 'app-review-recipient-tony',
			legacyFirestoreId: null,
			contactId: 'tony-stark-contact',
			startDate: new Date('1970-05-29T00:00:00.000Z'),
			status: RecipientStatus.active,
			successorName: 'Pepper Potts',
			termsAccepted: true,
			paymentInformationId: 'stark-payment-info',
			programId: 'avengers-program',
			localPartnerId: 'stark-industries-partner',
			createdAt: new Date(),
			updatedAt: new Date(),

			localPartner: {
				id: 'stark-industries-partner',
				accountId: 'stark-industries-account',
				legacyFirestoreId: null,
				name: 'Stark Industries',
				causes: [],
				contactId: 'stark-industries-contact',
				createdAt: new Date(),
				updatedAt: new Date(),
			},

			program: {
				id: 'avengers-program',
				name: 'Avengers Initiative',
				amountOfRecipientsForStart: 6,
				programDurationInMonths: 60,
				payoutPerInterval: new Prisma.Decimal(5000000),
				payoutCurrency: 'USD',
				payoutInterval: PayoutInterval.monthly,
				targetCauses: [],
				countryId: 'usa',
				country: {
					isoCode: 'US',
				},
				createdAt: new Date(),
				updatedAt: new Date(),
			},

			contact: {
				id: 'tony-stark-contact',
				firstName: 'Tony',
				lastName: 'Stark',
				callingName: 'Iron Man',
				email: 'tony@starkindustries.com',
				gender: Gender.male,
				language: 'en',
				dateOfBirth: new Date('1970-05-29'),
				profession: 'Genius, billionaire, playboy, philanthropist',
				addressId: 'stark-tower-address',
				phoneId: 'tony-stark-phone',
				isInstitution: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				phone: {
					id: 'tony-stark-phone',
					number: phone,
					hasWhatsApp: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			},

			paymentInformation: {
				id: 'stark-payment-info',
				code: 'IRONMAN',
				provider: PaymentProvider.orange_money,
				phoneId: 'ironman-payment-phone',
				createdAt: new Date(),
				updatedAt: new Date(),
				phone: {
					id: 'ironman-payment-phone',
					number: phone,
					hasWhatsApp: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			},
		};

		return this.resultOk(recipient);
	}
}
