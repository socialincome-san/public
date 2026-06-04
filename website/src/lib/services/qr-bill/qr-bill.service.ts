import {
	ContributionStatus,
	CountryCode,
	DonationInterval,
	PaymentEventType,
	type Prisma,
	PrismaClient,
} from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { DateTime } from 'luxon';
import { CampaignReadService } from '../campaign/campaign-read.service';
import { ContributionWriteService } from '../contribution/contribution-write.service';
import { type PaymentEventCreateInput } from '../contribution/contribution.types';
import { ContributorReadService } from '../contributor/contributor-read.service';
import { ContributorWriteService } from '../contributor/contributor-write.service';
import { type BankContributorData, type ContributorUpdateInput } from '../contributor/contributor.types';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import {
	type CreateWizardQrReferencesInput,
	type GetQrOnboardingPrefillInput,
	type QrBillOnboardingPrefill,
	type QrBillReferenceResult,
	type UpdateContributorAfterQrPaymentInput,
	type UpdateContributorAfterQrPaymentResult,
	type UpdateContributorReferralAfterQrPaymentInput,
	type UpdateContributorReferralAfterQrPaymentResult,
	type WizardQrPayment,
} from './qr-bill.types';

type QrContributorWithContact = Prisma.ContributorGetPayload<{
	include: { contact: { include: { address: true } } };
}>;

export class QrBillService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly contributorWriteService: ContributorWriteService,
		private readonly contributorReadService: ContributorReadService,
		private readonly campaignService: CampaignReadService,
		private readonly contributionService: ContributionWriteService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async getOrCreateQrReferences(
		contributorData: CreateWizardQrReferencesInput,
	): Promise<ServiceResult<QrBillReferenceResult>> {
		const contributorReferenceIdResult = await this.contributorWriteService.getOrCreateReferenceIdByEmail(
			contributorData.email,
		);
		if (!contributorReferenceIdResult.success) {
			return this.resultFail(contributorReferenceIdResult.error);
		}

		const contributorUpsertResult = await this.contributorWriteService.getOrCreateByReferenceId({
			...contributorData,
			paymentReferenceId: contributorReferenceIdResult.data,
		});
		if (!contributorUpsertResult.success) {
			return this.resultFail(contributorUpsertResult.error);
		}

		const contributionReferenceId = Math.round(DateTime.now().toMillis() / 1000).toString();

		return this.resultOk({
			contributorReferenceId: contributorReferenceIdResult.data,
			contributionReferenceId,
		});
	}

	async createPendingContribution(payment: WizardQrPayment, userData: BankContributorData): Promise<ServiceResult<string>> {
		try {
			const verifiedContributor = await this.verifyContributorByPaymentReference(
				userData.paymentReferenceId,
				userData.email,
			);
			if (!verifiedContributor.success) {
				return verifiedContributor;
			}

			const contributor = await this.contributorWriteService.getOrCreateByReferenceId(userData);

			if (!contributor.success) {
				return this.resultFail(`Could not get or create contributor for reference Id ${userData.paymentReferenceId}`);
			}

			const newContribution = await this.buildContribution(payment, contributor.data.id, payment.campaignId);
			if (!newContribution.success) {
				return this.resultFail(`Could not build new contribution for reference Id ${payment.referenceId}`);
			}
			const createdContribution = await this.contributionService.upsertFromBankTransfer(newContribution.data);
			if (!createdContribution.success) {
				return this.resultFail(`Could not generate pending contribution for reference id ${payment.referenceId}`);
			}

			return this.resultOk('Contribution created');
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Failed to store contribution');
		}
	}

	async getOnboardingPrefill(input: GetQrOnboardingPrefillInput): Promise<ServiceResult<QrBillOnboardingPrefill>> {
		try {
			const verifiedContributor = await this.verifyContributorByPaymentReference(
				input.paymentReferenceId,
				input.expectedEmail,
			);
			if (!verifiedContributor.success) {
				return verifiedContributor;
			}

			const { contributor } = verifiedContributor.data;
			const country = contributor.contact?.address?.country;
			const parsedCountry = country && Object.values(CountryCode).includes(country) ? country : undefined;

			return this.resultOk({
				email: contributor.contact?.email ?? undefined,
				firstname: contributor.contact?.firstName ?? undefined,
				lastname: contributor.contact?.lastName ?? undefined,
				country: parsedCountry,
				needsOnboarding: contributor.needsOnboarding,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not load QR onboarding prefill');
		}
	}

	async updateContributorAfterQrPayment(
		input: UpdateContributorAfterQrPaymentInput,
	): Promise<ServiceResult<UpdateContributorAfterQrPaymentResult>> {
		try {
			const { paymentReferenceId, expectedEmail, user } = input;
			const verifiedContributor = await this.verifyContributorByPaymentReference(paymentReferenceId, expectedEmail);
			if (!verifiedContributor.success) {
				return verifiedContributor;
			}

			const { contributor, email: contributorEmail } = verifiedContributor.data;

			const updateInput: ContributorUpdateInput = {
				...(user.personal.referral !== undefined ? { referral: user.personal.referral } : {}),
				needsOnboarding: false,
				contact: {
					update: {
						data: {
							firstName: user.personal.name,
							lastName: user.personal.lastname,
							email: contributorEmail,
							gender: user.personal.gender ?? null,
							language: user.language,
							address: {
								upsert: {
									update: {
										country: user.address.country,
									},
									create: {
										street: '',
										number: '',
										city: '',
										zip: '',
										country: user.address.country,
									},
								},
							},
						},
					},
				},
			};

			return this.contributorWriteService.updateSelf(contributor.id, updateInput);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not update contributor after QR payment');
		}
	}

	async updateReferralAfterQrPayment(
		input: UpdateContributorReferralAfterQrPaymentInput,
	): Promise<ServiceResult<UpdateContributorReferralAfterQrPaymentResult>> {
		try {
			const { paymentReferenceId, expectedEmail, referral } = input;
			const verifiedContributor = await this.verifyContributorByPaymentReference(paymentReferenceId, expectedEmail);
			if (!verifiedContributor.success) {
				return verifiedContributor;
			}

			const { contributor, email: contributorEmail } = verifiedContributor.data;

			return this.contributorWriteService.updateSelf(contributor.id, {
				referral,
				contact: {
					update: {
						data: {
							email: contributorEmail,
						},
					},
				},
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not update contributor referral after QR payment');
		}
	}

	private normalizeEmail(email: string): string {
		return email.trim().toLowerCase();
	}

	private async verifyContributorByPaymentReference(
		paymentReferenceId: string,
		expectedEmail: string,
	): Promise<ServiceResult<{ contributor: QrContributorWithContact; email: string }>> {
		try {
			const contributor = await this.db.contributor.findFirst({
				where: { paymentReferenceId },
				include: { contact: { include: { address: true } } },
			});

			if (!contributor) {
				return this.resultFail('Contributor not found for payment reference');
			}

			const contributorEmail = contributor.contact?.email;
			if (!contributorEmail) {
				return this.resultFail('Contributor email is required');
			}

			const normalizedContributorEmail = this.normalizeEmail(contributorEmail);
			if (normalizedContributorEmail !== this.normalizeEmail(expectedEmail)) {
				return this.resultFail('Contributor email does not match QR donor email');
			}

			return this.resultOk({ contributor, email: normalizedContributorEmail });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not verify contributor for payment reference');
		}
	}

	private async resolveCampaignId(campaignId?: string): Promise<ServiceResult<string>> {
		if (campaignId) {
			const campaignResult = await this.campaignService.getById(campaignId);
			if (campaignResult.success) {
				return this.resultOk(campaignResult.data.id);
			}
		}

		const fallbackCampaignResult = await this.campaignService.getFallbackCampaign();
		if (!fallbackCampaignResult.success) {
			return this.resultFail('Could not get campaign ID');
		}

		return this.resultOk(fallbackCampaignResult.data.id);
	}

	private async buildContribution(
		payment: WizardQrPayment,
		contributorId: string,
		campaignIdFromContext?: string,
	): Promise<ServiceResult<PaymentEventCreateInput>> {
		const campaignIdResult = await this.resolveCampaignId(campaignIdFromContext ?? payment.campaignId);
		if (!campaignIdResult.success) {
			return campaignIdResult;
		}

		const paymentEvent: PaymentEventCreateInput = {
			type: PaymentEventType.bank_transfer,
			transactionId: payment.referenceId,
			metadata: {
				raw_content: '',
			},
			contribution: {
				create: {
					amount: payment.amount,
					currency: payment.currency,
					amountChf: payment.amount,
					feesChf: 0,
					interval: this.getDonationInterval(payment.interval),
					status: ContributionStatus.pending,
					campaign: {
						connect: {
							id: campaignIdResult.data,
						},
					},
					contributor: {
						connect: { id: contributorId },
					},
				},
			},
		};

		return this.resultOk(paymentEvent);
	}

	private getDonationInterval(interval: number): DonationInterval | null {
		switch (interval) {
			case 1:
				return DonationInterval.monthly;
			case 3:
				return DonationInterval.quarterly;
			case 12:
				return DonationInterval.yearly;

			default:
				return null;
		}
	}
}
