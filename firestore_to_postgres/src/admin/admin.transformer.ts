import { UserRole } from '@prisma/client';
import { CreateUserInput } from '@socialincome/shared/src/database/services/user/user.types';
import { BaseTransformer } from '../core/base.transformer';
import { AdminUserWithEmail } from './admin.extractor';

export class AdminsTransformer extends BaseTransformer<AdminUserWithEmail, CreateUserInput> {
	transform = async (input: AdminUserWithEmail[]): Promise<CreateUserInput[]> => {
		return input.map((admin): CreateUserInput => {
			const { firstName, lastName } = this.splitName(admin.name);

			return {
				email: admin.email,
				authUserId: null,
				firstName,
				lastName,
				role: this.getUserRoleFromAdmin(admin),
				gender: 'private',
				phone: null,
				company: null,
				referral: null,
				paymentReferenceId: null,
				stripeCustomerId: null,
				testUser: false,
				institution: false,
				language: null,
				currency: null,
				addressStreet: null,
				addressNumber: null,
				addressCity: null,
				addressZip: null,
				addressCountry: null,
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
				organizationId: null,
			};
		});
	};

	private getUserRoleFromAdmin(admin: AdminUserWithEmail): UserRole {
		if (admin.is_global_admin) return UserRole.globalAdmin;
		if (admin.is_global_analyst) return UserRole.globalAnalyst;
		return UserRole.user;
	}

	private splitName(name: string): { firstName: string; lastName: string } {
		const parts = name.trim().split(/\s+/);
		if (parts.length === 0) {
			return { firstName: '', lastName: '' };
		} else if (parts.length === 1) {
			return { firstName: parts[0], lastName: '' };
		} else {
			const [firstName, ...rest] = parts;
			return { firstName, lastName: rest.join(' ') };
		}
	}
}
