import { Gender } from '@prisma/client';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreLocalPartnerWithId, LocalPartnerCreateInput } from './local-partner.types';

export class LocalPartnerTransformer extends BaseTransformer<FirestoreLocalPartnerWithId, LocalPartnerCreateInput> {
	transform = async (input: FirestoreLocalPartnerWithId[]): Promise<LocalPartnerCreateInput[]> => {
		return input.map((org): LocalPartnerCreateInput => {
			const email = this.generateEmailFromName(org.name);

			return {
				legacyFirestoreId: org.id,
				name: org.name,
				contact: {
					create: {
						firstName: org.contactName ?? '',
						lastName: '',
						email,
						gender: Gender.private,
						phone: org.contactNumber
							? {
									create: {
										number: org.contactNumber,
										verified: false,
									},
								}
							: undefined,
					},
				},
			};
		});
	};

	private generateEmailFromName(name: string): string {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '@autocreated.socialincome';
	}
}
