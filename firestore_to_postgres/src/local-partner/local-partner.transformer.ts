import { Gender } from '@prisma/client';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreLocalPartnerWithId, LocalPartnerCreateInput } from './local-partner.types';

export class LocalPartnerTransformer extends BaseTransformer<FirestoreLocalPartnerWithId, LocalPartnerCreateInput> {
	transform = async (input: FirestoreLocalPartnerWithId[]): Promise<LocalPartnerCreateInput[]> => {
		return input.map(
			(org): LocalPartnerCreateInput => ({
				legacyFirestoreId: org.id,
				name: org.name,
				contact: {
					create: {
						firstName: org.contactName ?? '',
						lastName: '',
						gender: Gender.private,
						phone: org.contactNumber
							? {
									create: {
										number: org.contactNumber,
									},
								}
							: undefined,
					},
				},
			}),
		);
	};
}
