import { storageAdmin } from '@/lib/firebase/firebase-admin';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { DEFAULT_DONATION_CERTIFICATE_LANGUAGE, LANGUAGE_CODES, LanguageCode } from '@/lib/types/language';
import { DonationCertificate } from '@prisma/client';
import { withFile } from 'tmp-promise';
import { ContributionService } from '../contribution/contribution.service';
import { ContributorService } from '../contributor/contributor.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { DonationCertificateWriter } from './donation-certificate-writer';
import {
	DonationCertificateTableView,
	DonationCertificateTableViewRow,
	YourDonationCertificateTableView,
	YourDonationCertificateTableViewRow,
} from './donation-certificate.types';
import { DonationCertificateError } from './types';

export class DonationCertificateService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();
	private contributorService = new ContributorService();
	private contributionService = new ContributionService();
	private bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

	async getTableView(userId: string): Promise<ServiceResult<DonationCertificateTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;

			const certificates = await this.db.donationCertificate.findMany({
				where: {
					contributor: {
						contributions: {
							some: {
								campaign: { organizationId },
							},
						},
					},
				},
				select: {
					id: true,
					year: true,
					storagePath: true,
					createdAt: true,
					contributor: {
						select: {
							contact: {
								select: {
									firstName: true,
									lastName: true,
									email: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: DonationCertificateTableViewRow[] = certificates.map((c) => ({
				id: c.id,
				year: c.year,
				contributorFirstName: c.contributor.contact?.firstName ?? '',
				contributorLastName: c.contributor.contact?.lastName ?? '',
				email: c.contributor.contact?.email ?? '',
				storagePath: c.storagePath,
				createdAt: c.createdAt,
				permission,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch donation certificates');
		}
	}

	async getYourCertificatesTableView(contributorId: string): Promise<ServiceResult<YourDonationCertificateTableView>> {
		try {
			const certificates = await this.db.donationCertificate.findMany({
				where: { contributorId },
				select: {
					id: true,
					year: true,
					storagePath: true,
					createdAt: true,
					language: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: YourDonationCertificateTableViewRow[] = certificates.map((c) => ({
				id: c.id,
				year: c.year,
				language: c.language,
				createdAt: c.createdAt,
				storagePath: c.storagePath,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch donation certificates');
		}
	}

	async findByYearAndContributor(
		year: number,
		contributorsIds: string[],
	): Promise<ServiceResult<DonationCertificate[]>> {
		try {
			const existingCertificates = await this.db.donationCertificate.findMany({
				where: {
					year: year,
					contributorId: { in: contributorsIds },
				},
			});

			return this.resultOk(existingCertificates);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch existing donation certificates');
		}
	}

	async findByYearAndLanguage(
		year: number,
		contributorsId: string,
		language: LanguageCode,
	): Promise<ServiceResult<DonationCertificate | null>> {
		try {
			const existingCertificate = await this.db.donationCertificate.findFirst({
				where: {
					year: year,
					contributorId: contributorsId,
					language: language,
				},
			});

			return this.resultOk(existingCertificate);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch existing donation certificates');
		}
	}

	async createDonationCertificate(
		year: number,
		contributorsId: string,
		language?: LanguageCode,
	): Promise<ServiceResult<void>> {
		if (!this.bucketName) {
			this.logger.error('Firebase Storage bucket name missing');
			return this.resultFail(DonationCertificateError.bucketMissing);
		}

		// get contributor language or "en" as fallback
		const lang =
			LANGUAGE_CODES.find((l) => l === language) ||
			LANGUAGE_CODES.find((l) => l === contributor.language) ||
			DEFAULT_DONATION_CERTIFICATE_LANGUAGE;

		// check if certificate was already generated
		const existingCertificate = await this.findByYearAndLanguage(year, contributorsId, lang);
		if (!existingCertificate.success) {
			this.logger.info(`Could not load existing certificates for contributor ${contributorsId}`);
			return this.resultFail(DonationCertificateError.technicalError);
		}
		if (existingCertificate.data) {
			this.logger.info(`Donation certificates already exists for contributor ${contributorsId}`);
			return this.resultFail(DonationCertificateError.alreadyExists);
		}

		// check if there are contributions to generate a certificate for
		let contributions = await this.contributionService.getForContributorAndYear(contributorsId, year);
		if (!contributions.success) {
			this.logger.info(`Could not load contributions for contributor ${contributorsId}`);
			return this.resultFail(DonationCertificateError.technicalError);
		}
		if (!contributions.data.length) {
			this.logger.info(`Contributor ${contributorsId} has no contributions`);
			return this.resultFail(DonationCertificateError.noContributions);
		}

		// get contributor for ID
		const result = await this.contributorService.getByIds([contributorsId]);
		if (!result.success || !result.data?.length) {
			this.logger.info(`Could not load contributor for contributor ID ${contributorsId}`);
			return this.resultFail(DonationCertificateError.technicalError);
		}
		const contributor = result.data[0];

		try {
			const writer = new DonationCertificateWriter(contributor, contributions.data, year);

			// The Firebase auth user ID is used in the storage path to check the user's permissions in the storage rules.
			const destinationFilePath = `users/${contributor.authId}/donation-certificates/${year}_${lang}.pdf`;

			await withFile(async ({ path }) => {
				await writer.writeDonationCertificatePDF(path, lang);
				const bucket = storageAdmin.storage.bucket(this.bucketName);
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
			this.logger.error(`Error while generating Donation Certificate file: ${e}`);
			return this.resultFail(DonationCertificateError.technicalError);
		}
		return this.resultOk(undefined);
	}

	async createDonationCertificates(
		year: number,
		contributorsIds: string[],
		language?: LanguageCode,
	): Promise<ServiceResult<string>> {
		let [successCount, creationWithFailures, skippedExists, skippedNoContributions] = [
			0,
			[] as string[],
			[] as string[],
			[] as string[],
		];

		await Promise.all(
			contributorsIds.map(async (contributorsId) => {
				const result = await this.createDonationCertificate(year, contributorsId, language);
				if (!result.success) {
					switch (result.error) {
						case DonationCertificateError.alreadyExists:
							skippedExists.push(contributorsId);
						case DonationCertificateError.noContributions:
							skippedNoContributions.push(contributorsId);

						default:
							creationWithFailures.push(contributorsId);
					}
				} else successCount++;
			}),
		);
		if (successCount === 0) {
			return this.resultFail(`Error while creating donation certificates for ${year}.
				No donation certificates created.
				Skipped, because certificate already exists (${skippedExists.length}): ${skippedExists.join(', ')}
				Skipped, because no contributions available for contributor (${skippedNoContributions.length}): ${skippedNoContributions.join(', ')}
				Users with errors (${creationWithFailures.length}): ${creationWithFailures.join(', ')}`);
		} else {
			const success = `Successfully created ${successCount} donation certificates for ${year}.
				Skipped, because certificate already exists (${skippedExists.length}): ${skippedExists.join(', ')}
				Skipped, because no contributions available for contribot (${skippedNoContributions.length}): ${skippedNoContributions.join(', ')}
				Users with errors (${creationWithFailures.length}): ${creationWithFailures.join(', ')}`;
			this.logger.info(success);
			return this.resultOk(success);
		}
	}
}
