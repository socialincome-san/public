import { withFile } from 'tmp-promise';
import { StorageAdmin } from '../../../firebase/admin/StorageAdmin';
import { ContributionService } from '../contribution/contribution.service';
import { ContributorService } from '../contributor/contributor.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { DonationCertificateTableView, DonationCertificateTableViewRow } from './donation-certificate.types';
import { DonationCertificateWriter } from './DonationCertificateWriter';

export class DonationCertificateService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();
	private contributorService = new ContributorService();
	private contributionService = new ContributionService();
	private storageAdmin = new StorageAdmin();
	private bucketName = process.env.FIREBASE_STORAGE_BUCKET;

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
			console.error(error);
			return this.resultFail('Could not fetch donation certificates');
		}
	}

	async createDonationCertificates(year: number, contributorsIds?: string[]): Promise<ServiceResult<string>> {
		let [successCount, usersWithFailures] = [0, [] as string[]];

		const result = await this.contributorService.getForDonationCertificate(contributorsIds);
		if (!result.success) return this.resultFail('Could not get contributors');
		const contributors = result.data;

		await Promise.all(
			contributors.map(async (contributor) => {
				try {
					if (contributor.authId === undefined) {
						console.info(`User ${contributor.id} has no auth_user_id, skipping donation certificate creation`);
						return;
					}

					const existingCertificate = await this.db.donationCertificate.findMany({
						where: {
							year: year,
							contributorId: contributor.id,
						},
					});

					if (existingCertificate.length) {
						console.info(
							`User ${contributor.id} already has a certificate for year ${year}, skipping donation certificate creation`,
						);
						return;
					}

					let contributions = await this.contributionService.getForContributor(contributor.id);
					if (!contributions.success) {
						console.info(`User ${contributor.id} has no contributions, skipping donation certificate creation`);
						return;
					}
					const writer = new DonationCertificateWriter(contributor, contributions.data, year);

					// The Firebase auth user ID is used in the storage path to check the user's permissions in the storage rules.
					const destinationFilePath = `users/${contributor.authId}/donation-certificates/${year}.pdf`;

					await withFile(async ({ path }) => {
						await writer.writeDonationCertificatePDF(path);
						const bucket = this.storageAdmin.storage.bucket(this.bucketName);
						await this.storageAdmin.uploadFile({ bucket, sourceFilePath: path, destinationFilePath });

						await this.db.donationCertificate.create({
							data: {
								year: year,
								storagePath: destinationFilePath,
								contributor: {
									connect: {
										id: contributor.id,
									},
								},
							},
						});

						console.info(`Donation certificate document written for user ${contributor.id}`);
						successCount += 1;
					});
				} catch (e) {
					usersWithFailures.push(contributor.id);
					console.error(e);
				}
			}),
		);
		if (successCount === 0) {
			return this.resultFail(`No donation certificates created for ${year} 
	Users with errors (${usersWithFailures.length}): ${usersWithFailures.join(',')}`);
		} else {
			return this.resultOk(`Successfully created ${successCount} donation certificates for ${year} 
	Users with errors (${usersWithFailures.length}): ${usersWithFailures.join(',')}`);
		}
	}
}
