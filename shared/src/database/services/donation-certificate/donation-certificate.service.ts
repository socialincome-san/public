import { DonationCertificate } from '@prisma/client';
import { withFile } from 'tmp-promise';
import { StorageAdmin } from '../../../firebase/admin/StorageAdmin';
import { LanguageCode } from '../../../types/language';
import { ContributionService } from '../contribution/contribution.service';
import { ContributorService } from '../contributor/contributor.service';
import { ContributorDonationCertificate } from '../contributor/contributor.types';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { DonationCertificateWriter } from './donation-certificate-writer';
import {
	DonationCertificateCreateManyInput,
	DonationCertificateTableView,
	DonationCertificateTableViewRow,
} from './donation-certificate.types';

const batchArray = <T>(array: T[], batchSize: number) => {
	const numBatches = Math.ceil(array.length / batchSize);

	return Array.from({ length: numBatches }, (_, index) => {
		const start = index * batchSize;
		const end = start + batchSize;
		return array.slice(start, end);
	});
};

function groupCertificatesByContribution(certificates: DonationCertificate[]): Map<string, string[]> {
	const groupedCertificates = new Map<string, string[]>();

	for (const cert of certificates) {
		const { contributorId, language } = cert;
		if (!language) continue;
		if (groupedCertificates.has(contributorId)) {
			groupedCertificates.get(contributorId)!.push(language);
		} else {
			groupedCertificates.set(contributorId, [language]);
		}
	}
	return groupedCertificates;
}

export class DonationCertificateService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();
	private contributorService = new ContributorService();
	private contributionService = new ContributionService();
	private storageAdmin = new StorageAdmin();
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

	async createDonationCertificates(year: number, contributorsIds?: string[]): Promise<ServiceResult<string>> {
		let [successCount, creationWithFailures, creationSkipped] = [0, [] as string[], [] as string[]];

		if (!this.bucketName) {
			this.logger.error('Firebase Storage bucket name missing');
			return this.resultFail('Firebase Storage bucket name missing');
		}

		const result = await this.contributorService.getByIds(contributorsIds);
		if (!result.success || !result.data?.length) return this.resultFail('Could not get contributors');
		const contributors = result.data;

		const existingCertificates = await this.findByYearAndContributor(
			year,
			contributors.map((c) => c.id),
		);
		if (!existingCertificates.success) return this.resultFail('Could not get existing certificates for contributors');
		const existingCertificatesWithLanguages = groupCertificatesByContribution(existingCertificates.data);

		let contributions = await this.contributionService.getForContributorsAndYear(
			contributors.map((c) => c.id),
			year,
		);
		if (!contributions.success) return this.resultFail('Could not get contributions for contributors');

		const donationCertificatesToCreate: DonationCertificateCreateManyInput[] = [];

		const contributorBatches = batchArray<ContributorDonationCertificate>(contributors, 200);

		for await (const contributorBatch of contributorBatches) {
			await Promise.all(
				contributorBatch.map(async (contributor) => {
					try {
						if (contributor.authId === undefined) {
							this.logger.info(`User ${contributor.id} has no auth_user_id, skipping donation certificate creation`);
							creationSkipped.push(contributor.id);
							return;
						}

						const contributionsForContributor = contributions.data?.filter((c) => c.contributorId === contributor.id);

						if (!contributionsForContributor?.length) {
							this.logger.info(`User ${contributor.id} has no contributions, skipping donation certificate creation`);
							creationSkipped.push(contributor.id);
							return;
						}
						const writer = new DonationCertificateWriter(contributor, contributionsForContributor, year);
						const languagesToCreate = ['de', 'en', 'fr', 'it'] as LanguageCode[];

						for await (const lang of languagesToCreate) {
							// languagesToCreate.map(async (lang) => {
							// The Firebase auth user ID is used in the storage path to check the user's permissions in the storage rules.
							const destinationFilePath = `users/${contributor.authId}/donation-certificates/${year}_${lang}.pdf`;
							// get existing languages and check if file was already written for this contributor and language
							const existingLanguages = existingCertificatesWithLanguages.get(contributor.id);
							if (existingLanguages?.includes(lang)) {
								this.logger.info(
									`User ${contributor.id} already has a certificate for year ${year} and language ${lang}, skipping donation certificate creation`,
								);
								creationSkipped.push(contributor.id);
								return;
							}

							await withFile(async ({ path }) => {
								await writer.writeDonationCertificatePDF(path, lang);
								const bucket = this.storageAdmin.storage.bucket(this.bucketName);
								await this.storageAdmin.uploadFile({ bucket, sourceFilePath: path, destinationFilePath });
								donationCertificatesToCreate.push({
									year: year,
									language: lang,
									storagePath: destinationFilePath,
									contributorId: contributor.id,
								});

								this.logger.info(`Donation certificate document written for user ${contributor.id}`);
							});
						}
					} catch (e) {
						creationWithFailures.push(contributor.id);
						this.logger.error(e);
					}
				}),
			);
		}
		try {
			await this.db.donationCertificate.createMany({
				data: donationCertificatesToCreate,
			});
			successCount = donationCertificatesToCreate.length;
		} catch (error) {
			creationWithFailures.push(...donationCertificatesToCreate.map((d) => d.contributorId));
			this.logger.error(error);
		}

		if (creationWithFailures.length !== 0) {
			return this.resultFail(`Error while creating donation certificates for ${year}.
	Successfully created ${successCount} donation certificates 
	Creations skipped (${creationSkipped.length}): ${creationSkipped.join(', ')}.
	Users with errors (${creationWithFailures.length}): ${creationWithFailures.join(', ')}`);
		} else {
			const success = `Successfully created ${successCount} donation certificates for ${year}. 
	Creations skipped (${creationSkipped.length}): ${creationSkipped.join(', ')}.
	Users with errors (${creationWithFailures.length}): ${creationWithFailures.join(', ')}`;
			this.logger.info(success);
			return this.resultOk(success);
		}
	}
}
