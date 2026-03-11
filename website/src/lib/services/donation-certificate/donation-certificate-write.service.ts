import { PrismaClient } from '@/generated/prisma/client';
import { storageAdmin } from '@/lib/firebase/firebase-admin';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { DEFAULT_DONATION_CERTIFICATE_LANGUAGE, LANGUAGE_CODES, LanguageCode } from '@/lib/types/language';
import { logger } from '@/lib/utils/logger';
import { withFile } from 'tmp-promise';
import { ContributionReadService } from '../contribution/contribution-read.service';
import { ContributorReadService } from '../contributor/contributor-read.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { DonationCertificateReadService } from './donation-certificate-read.service';
import { DonationCertificateWriter } from './donation-certificate-writer';
import { DonationCertificateError } from './types';

const isDonationCertificateError = (value: string): value is DonationCertificateError => {
	return Object.values(DonationCertificateError).includes(value as DonationCertificateError);
};

export class DonationCertificateWriteService extends BaseService {
	private bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

	constructor(
		db: PrismaClient,
		private readonly contributorService: ContributorReadService,
		private readonly contributionService: ContributionReadService,
		private readonly donationCertificateReadService: DonationCertificateReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async createDonationCertificate(
		year: number,
		contributorsId: string,
		language?: LanguageCode,
	): Promise<ServiceResult<void>> {
		try {
			if (!this.bucketName) {
				this.logger.error('Firebase Storage bucket name missing');
				return this.resultFail(DonationCertificateError.bucketMissing);
			}

			const result = await this.contributorService.getByIds([contributorsId]);
			if (!result.success || !result.data?.length) {
				this.logger.info(`Could not load contributor for contributor ID ${contributorsId}`);
				return this.resultFail(DonationCertificateError.technicalError);
			}
			const contributor = result.data[0];

			const lang =
				LANGUAGE_CODES.find((l) => l === language) ||
				LANGUAGE_CODES.find((l) => l === contributor.language) ||
				DEFAULT_DONATION_CERTIFICATE_LANGUAGE;

			const existingCertificate = await this.donationCertificateReadService.findByYearAndLanguage(
				year,
				contributorsId,
				lang,
			);
			if (!existingCertificate.success) {
				this.logger.info(`Could not load existing certificates for contributor ${contributorsId}`);
				return this.resultFail(DonationCertificateError.technicalError);
			}
			if (existingCertificate.data) {
				this.logger.info(`Donation certificates already exists for contributor ${contributorsId}`);
				return this.resultFail(DonationCertificateError.alreadyExists);
			}

			const contributions = await this.contributionService.getSucceededForContributorAndYear(contributorsId, year);
			if (!contributions.success) {
				this.logger.info(`Could not load contributions for contributor ${contributorsId}`);
				return this.resultFail(DonationCertificateError.technicalError);
			}
			if (!contributions.data.length) {
				this.logger.info(`Contributor ${contributorsId} has no contributions`);
				return this.resultFail(DonationCertificateError.noContributions);
			}

			const writer = new DonationCertificateWriter(contributor, contributions.data, year);
			const destinationFilePath = `users/${contributor.authId}/donation-certificates/${year}_${lang}.pdf`;

			await withFile(async ({ path }) => {
				const writeResult = await writer.writeDonationCertificatePDF(path, lang);
				if (!writeResult.success) {
					throw new Error(writeResult.error);
				}
				const bucket = storageAdmin.storage.bucket(this.bucketName!);
				await storageAdmin.uploadFile({ bucket, sourceFilePath: path, destinationFilePath });

				this.logger.info(`Donation certificate document written for user ${contributor.id}`);
			});
			await this.db.donationCertificate.createMany({
				data: {
					year: year,
					language: lang as WebsiteLanguage,
					storagePath: destinationFilePath,
					contributorId: contributor.id,
				},
			});
		} catch (e) {
			this.logger.error(`Error while generating Donation Certificate file: ${String(e)}`);
			return this.resultFail(DonationCertificateError.technicalError);
		}
		return this.resultOk(undefined);
	}

	async createDonationCertificates(
		year: number,
		contributorsIds: string[],
		language?: LanguageCode,
	): Promise<ServiceResult<string>> {
		try {
			let successCount = 0;
			const creationWithFailures: string[] = [];
			const skippedExists: string[] = [];
			const skippedNoContributions: string[] = [];

			await Promise.all(
				contributorsIds.map(async (contributorsId) => {
					const result = await this.createDonationCertificate(year, contributorsId, language);
					if (!result.success) {
						if (!isDonationCertificateError(result.error)) {
							creationWithFailures.push(contributorsId);
							return;
						}
						switch (result.error) {
							case DonationCertificateError.alreadyExists:
								skippedExists.push(contributorsId);
								break;
							case DonationCertificateError.noContributions:
								skippedNoContributions.push(contributorsId);
								break;

							default:
								creationWithFailures.push(contributorsId);
								break;
						}
					} else {
						successCount++;
					}
				}),
			);
			if (successCount === 0) {
				return this.resultFail(`Error while creating donation certificates for ${year}.
					No donation certificates created.
					Skipped, because certificate already exists (${skippedExists.length}): ${skippedExists.join(', ')}
					Skipped, because no contributions available for contributor (${skippedNoContributions.length}): ${skippedNoContributions.join(', ')}
					Users with errors (${creationWithFailures.length}): ${creationWithFailures.join(', ')}`);
			}

			const success = `Successfully created ${successCount} donation certificates for ${year}.
					Skipped, because certificate already exists (${skippedExists.length}): ${skippedExists.join(', ')}
					Skipped, because no contributions available for contribot (${skippedNoContributions.length}): ${skippedNoContributions.join(', ')}
					Users with errors (${creationWithFailures.length}): ${creationWithFailures.join(', ')}`;
			this.logger.info(success);
			return this.resultOk(success);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Error while creating donation certificates for ${year}: ${JSON.stringify(error)}`);
		}
	}
}
