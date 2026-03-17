import { Currency, PrismaClient, UserRole } from '@/generated/prisma/client';
import { getCountryNameByCode } from '@/lib/types/country';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { EMAIL_REGEX } from '@/lib/utils/regex';
import { CandidateWriteService } from '../candidate/candidate-write.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { OrganizationWriteService } from '../organization/organization-write.service';
import { ProgramAccessWriteService } from '../program-access/program-access-write.service';
import { CreateProgramInput, PublicOnboardingUserDetails } from './program.types';

export class ProgramWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessWriteService,
		private readonly candidateService: CandidateWriteService,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly organizationWriteService: OrganizationWriteService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(
		input: CreateProgramInput,
		actor: { userId: string } | PublicOnboardingUserDetails,
	): Promise<ServiceResult<{ programId: string }>> {
		try {
			let userId = 'userId' in actor ? actor.userId : null;
			if (!userId && 'email' in actor) {
				const createUserResult = await this.createUserAndOrganizationFromDetails(actor);
				if (!createUserResult.success) {
					return this.resultFail(createUserResult.error);
				}

				userId = createUserResult.data.userId;
			}
			if (!userId) {
				return this.resultFail('User not found');
			}

			const user = await this.db.user.findUnique({
				where: { id: userId },
				select: { activeOrganizationId: true },
			});

			if (!user?.activeOrganizationId) {
				return this.resultFail('User has no active organization');
			}

			const operatorFallbackOrg = await this.db.organization.findFirst({
				where: { isOperatorFallback: true },
				select: { id: true },
			});

			if (!operatorFallbackOrg) {
				return this.resultFail('Operator fallback organization not found');
			}

			const country = await this.db.country.findUnique({
				where: { id: input.countryId },
				select: { isoCode: true },
			});

			if (!country) {
				return this.resultFail('Country not found');
			}

			const program = await this.db.program.create({
				data: {
					name: `${getCountryNameByCode(country.isoCode)} Program ${Math.floor(10000 + Math.random() * 90000)}`,
					countryId: input.countryId,
					amountOfRecipientsForStart: input.amountOfRecipientsForStart ?? null,
					programDurationInMonths: input.programDurationInMonths,
					payoutPerInterval: input.payoutPerInterval,
					payoutInterval: input.payoutInterval,
					targetCauses: input.targetCauses,
				},
			});

			const defaultCampaignEndDate = now();
			defaultCampaignEndDate.setFullYear(defaultCampaignEndDate.getFullYear() + 10);

			await this.db.campaign.create({
				data: {
					title: `${program.name} - Default Campaign`,
					description: `Default active campaign for ${program.name}.`,
					currency: Currency.CHF,
					endDate: defaultCampaignEndDate,
					isActive: true,
					program: { connect: { id: program.id } },
					organization: { connect: { id: user.activeOrganizationId } },
				},
			});

			const accessResult = await this.programAccessService.createInitialAccessesForProgram({
				programId: program.id,
				ownerOrganizationId: user.activeOrganizationId,
				operatorFallbackOrganizationId: operatorFallbackOrg.id,
			});

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			if (input.amountOfRecipientsForStart > 0) {
				const assignResult = await this.candidateService.assignRandomCandidatesToProgram(
					program.id,
					input.amountOfRecipientsForStart,
					country.isoCode,
					input.targetCauses,
				);

				if (!assignResult.success) {
					return this.resultFail(assignResult.error);
				}
			}

			return this.resultOk({ programId: program.id });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create program: ${JSON.stringify(error)}`);
		}
	}

	private async createUserAndOrganizationFromDetails(
		userDetails: PublicOnboardingUserDetails,
	): Promise<ServiceResult<{ userId: string }>> {
		const normalizedEmail = userDetails.email.trim().toLowerCase();
		const firstName = userDetails.firstName.trim();
		const lastName = userDetails.lastName.trim();
		if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
			return this.resultFail('Please enter a valid email address');
		}
		if (!firstName || !lastName) {
			return this.resultFail('Please enter your first name and last name');
		}

		const existingContact = await this.db.contact.findUnique({
			where: { email: normalizedEmail },
			select: {
				id: true,
				user: {
					select: {
						id: true,
					},
				},
				contributor: {
					select: {
						accountId: true,
						contactId: true,
					},
				},
			},
		});
		if (existingContact) {
			if (existingContact.user) {
				this.logger.info('Public onboarding reusing existing user', {
					email: normalizedEmail,
					contactId: existingContact.id,
					userId: existingContact.user.id,
				});

				return this.resultOk({ userId: existingContact.user.id });
			}

			if (existingContact.contributor) {
				const contributor = existingContact.contributor;
				this.logger.info('Public onboarding upgrading contributor to user', {
					email: normalizedEmail,
					contactId: existingContact.id,
				});

				try {
					const createdUser = await this.db.$transaction(async (tx) => {
						const organizationResult = await this.organizationWriteService.createFromEmail(normalizedEmail, tx);
						if (!organizationResult.success) {
							throw new Error(organizationResult.error);
						}

						return tx.user.create({
							data: {
								role: UserRole.user,
								account: { connect: { id: contributor.accountId } },
								contact: { connect: { id: contributor.contactId } },
								activeOrganization: { connect: { id: organizationResult.data.id } },
								organizationAccesses: {
									create: {
										organizationId: organizationResult.data.id,
										permission: 'edit',
									},
								},
							},
							select: { id: true },
						});
					});

					return this.resultOk({ userId: createdUser.id });
				} catch (error) {
					this.logger.error('Public onboarding failed for contributor upgrade', {
						email: normalizedEmail,
						contactId: existingContact.id,
						error,
					});

					return this.resultFail('Unable to process request');
				}
			}

			this.logger.warn('Public onboarding blocked for non-user existing contact', {
				email: normalizedEmail,
				contactId: existingContact.id,
			});

			return this.resultFail('Unable to process request');
		}

		const existingFirebaseUserResult = await this.firebaseAdminService.getByEmail(normalizedEmail);
		if (!existingFirebaseUserResult.success) {
			return this.resultFail(existingFirebaseUserResult.error);
		}

		const firebaseUserAlreadyExists = Boolean(existingFirebaseUserResult.data);
		const firebaseUserResult = await this.firebaseAdminService.getOrCreateUser({
			email: normalizedEmail,
			displayName: `${firstName} ${lastName}`,
		});
		if (!firebaseUserResult.success) {
			return this.resultFail(firebaseUserResult.error);
		}

		try {
			const createdUser = await this.db.$transaction(async (tx) => {
				const organizationResult = await this.organizationWriteService.createFromEmail(normalizedEmail, tx);
				if (!organizationResult.success) {
					throw new Error(organizationResult.error);
				}

				return tx.user.create({
					data: {
						role: UserRole.user,
						activeOrganization: { connect: { id: organizationResult.data.id } },
						contact: {
							create: {
								firstName,
								lastName,
								email: normalizedEmail,
							},
						},
						account: {
							create: {
								firebaseAuthUserId: firebaseUserResult.data.uid,
							},
						},
						organizationAccesses: {
							create: {
								organizationId: organizationResult.data.id,
								permission: 'edit',
							},
						},
					},
					select: { id: true },
				});
			});

			return this.resultOk({ userId: createdUser.id });
		} catch (error) {
			this.logger.error('Public onboarding database transaction failed', {
				email: normalizedEmail,
				firebaseUid: firebaseUserResult.data.uid,
				error,
			});

			if (!firebaseUserAlreadyExists) {
				const cleanupResult = await this.firebaseAdminService.deleteByUidIfExists(firebaseUserResult.data.uid);
				if (!cleanupResult.success) {
					this.logger.error('Public onboarding Firebase cleanup failed', {
						email: normalizedEmail,
						firebaseUid: firebaseUserResult.data.uid,
						cleanupError: cleanupResult.error,
					});
				}
			}

			return this.resultFail('Unable to process request');
		}
	}
}
