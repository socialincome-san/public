import { DonationCertificate } from '@prisma/client';
import { withFile } from 'tmp-promise';
import { StorageAdmin } from '../../../firebase/admin/StorageAdmin';
import { ContributionService } from '../contribution/contribution.service';
import { ContributorService } from '../contributor/contributor.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { DonationCertificateWriter } from './donation-certificate-writer';
import {
	DonationCertificateCreateManyInput,
	DonationCertificateTableView,
	DonationCertificateTableViewRow,
} from './donation-certificate.types';

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
		let [successCount, usersWithFailures, usersSkipped] = [0, [] as string[], [] as string[]];

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
		const existingCertificateContributorIds = new Set(existingCertificates.data.map((c) => c.contributorId));

		let contributions = await this.contributionService.getForContributors(contributors.map((c) => c.id));
		if (!contributions.success) return this.resultFail('Could not get contributions for contributors');

		const donationCertificatesToCreate: DonationCertificateCreateManyInput[] = [];

		await Promise.all(
			contributors.map(async (contributor) => {
				try {
					if (contributor.authId === undefined) {
						this.logger.info(`User ${contributor.id} has no auth_user_id, skipping donation certificate creation`);
						usersSkipped.push(contributor.id);
						return;
					}

					if (existingCertificateContributorIds.has(contributor.id)) {
						this.logger.info(
							`User ${contributor.id} already has a certificate for year ${year}, skipping donation certificate creation`,
						);
						usersSkipped.push(contributor.id);
						return;
					}

					const contributionsForContributor = contributions.data?.filter((c) => c.contributorId === contributor.id);

					if (!contributionsForContributor?.length) {
						this.logger.info(`User ${contributor.id} has no contributions, skipping donation certificate creation`);
						usersSkipped.push(contributor.id);
						return;
					}
					const writer = new DonationCertificateWriter(contributor, contributionsForContributor, year);

					// The Firebase auth user ID is used in the storage path to check the user's permissions in the storage rules.
					const destinationFilePath = `users/${contributor.authId}/donation-certificates/${year}.pdf`;

					await withFile(async ({ path }) => {
						await writer.writeDonationCertificatePDF(path);
						const bucket = this.storageAdmin.storage.bucket(this.bucketName);
						await this.storageAdmin.uploadFile({ bucket, sourceFilePath: path, destinationFilePath });
						donationCertificatesToCreate.push({
							year: year,
							storagePath: destinationFilePath,
							contributorId: contributor.id,
						});

						this.logger.info(`Donation certificate document written for user ${contributor.id}`);
					});
				} catch (e) {
					usersWithFailures.push(contributor.id);
					this.logger.error(e);
				}
			}),
		);
		try {
			await this.db.donationCertificate.createMany({
				data: donationCertificatesToCreate,
			});
			successCount = donationCertificatesToCreate.length;
		} catch (error) {
			usersWithFailures.concat(donationCertificatesToCreate.map((d) => d.contributorId));
			this.logger.error(error);
		}

		if (usersWithFailures.length !== 0) {
			return this.resultFail(`No donation certificates created for ${year}. 
	Users skipped (${usersSkipped.length}): ${usersSkipped.join(', ')}.
	Users with errors (${usersWithFailures.length}): ${usersWithFailures.join(', ')}`);
		} else {
			const success = `Successfully created ${successCount} donation certificates for ${year}. 
	Users skipped (${usersSkipped.length}): ${usersSkipped.join(', ')}.
	Users with errors (${usersWithFailures.length}): ${usersWithFailures.join(', ')}`;
			this.logger.info(success);
			return this.resultOk(success);
		}
	}
}
