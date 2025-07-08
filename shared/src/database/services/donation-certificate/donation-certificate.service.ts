import { DonationCertificate as PrismaDonationCertificate } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateDonationCertificateInput } from './donation-certificate.types';

export class DonationCertificateService extends BaseService {
	async create(input: CreateDonationCertificateInput): Promise<ServiceResult<PrismaDonationCertificate>> {
		try {
			const certificate = await this.db.donationCertificate.create({
				data: input,
			});

			return this.resultOk(certificate);
		} catch (e) {
			console.error('[DonationCertificateService.create]', e);
			return this.resultFail('Could not create donation certificate');
		}
	}
}
