import { CreateDonationCertificateInput } from '@socialincome/shared/src/database/services/donation-certificate/donation-certificate.types';
import { BaseTransformer } from '../core/base.transformer';
import { DonationCertificateWithEmail } from './donation-certificate.extractor';

export type CreateDonationCertificateInputWithoutFK = Omit<CreateDonationCertificateInput, 'userId'> & {
	email: string;
};

export class DonationCertificatesTransformer extends BaseTransformer<
	DonationCertificateWithEmail,
	CreateDonationCertificateInputWithoutFK
> {
	transform = async (input: DonationCertificateWithEmail[]): Promise<CreateDonationCertificateInputWithoutFK[]> => {
		return input.map((item) => ({
			country: item.country,
			year: item.year,
			storagePath: item.storage_path ?? (item as any).url ?? null,
			email: item.email,
		}));
	};
}
