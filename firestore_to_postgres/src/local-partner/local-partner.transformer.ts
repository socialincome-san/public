import { CreateLocalPartnerInput } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { CreateUserInput } from '@socialincome/shared/src/database/services/user/user.types';
import { PartnerOrganisation as FireStorePartnerOranisation } from '@socialincome/shared/src/types/partner-organisation';
import { BaseTransformer } from '../core/base.transformer';

export type CreateLocalPartnerWithUser = {
	user: CreateUserInput;
	localPartner: Omit<CreateLocalPartnerInput, 'userId'>;
};

export class LocalPartnersTransformer extends BaseTransformer<FireStorePartnerOranisation, CreateLocalPartnerWithUser> {
	transform = async (input: FireStorePartnerOranisation[]): Promise<CreateLocalPartnerWithUser[]> => {
		return input.map((org): CreateLocalPartnerWithUser => {
			return {
				user: {
					authUserId: null,
					email: this.generateEmailFromName(org.name),
					firstName: org.contactName || '',
					lastName: '',
					gender: 'private',
					phone: org.contactNumber || null,
					company: null,
					referral: null,
					paymentReferenceId: null,
					stripeCustomerId: null,
					testUser: false,
					institution: false,
					language: 'en',
					currency: null,
					addressStreet: null,
					addressNumber: null,
					addressCity: null,
					addressZip: null,
					addressCountry: null,
					role: 'user',
					organizationId: null,
					birthDate: null,
					communicationPhone: null,
					mobileMoneyPhone: null,
					hasWhatsAppComm: null,
					hasWhatsAppMobile: null,
					whatsappActivated: null,
					instaHandle: null,
					twitterHandle: null,
					profession: null,
					callingName: null,
					omUid: null,
				},
				localPartner: {
					name: org.name,
				},
			};
		});
	};

	private generateEmailFromName(name: string): string {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '@autocreated.socialincome';
	}
}
