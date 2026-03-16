import { Campaign, Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { CampaignFormCreateInput, CampaignFormUpdateInput } from './campaign-form-input';
import { CampaignValidationService } from './campaign-validation.service';

export class CampaignWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly organizationAccessService: OrganizationAccessService,
		private readonly campaignValidationService: CampaignValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(userId: string, input: CampaignFormCreateInput): Promise<ServiceResult<Campaign>> {
		const validatedInputResult = this.campaignValidationService.validateCreateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			if (accessResult.data.permission !== 'edit') {
				return this.resultFail('No permissions to create campaign');
			}

			const { id: organizationId } = accessResult.data;
			const uniquenessResult = await this.campaignValidationService.validateCreateUniqueness(validatedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			if (validatedInput.programId) {
				const program = await this.db.program.findUnique({
					where: { id: validatedInput.programId },
					select: { id: true },
				});
				if (!program) {
					return this.resultFail('Program not found.');
				}
			}

			const createData: Prisma.CampaignCreateInput = {
				title: validatedInput.title,
				description: validatedInput.description,
				secondDescriptionTitle: validatedInput.secondDescriptionTitle,
				secondDescription: validatedInput.secondDescription,
				thirdDescriptionTitle: validatedInput.thirdDescriptionTitle,
				thirdDescription: validatedInput.thirdDescription,
				linkWebsite: validatedInput.linkWebsite,
				linkInstagram: validatedInput.linkInstagram,
				linkTiktok: validatedInput.linkTiktok,
				linkFacebook: validatedInput.linkFacebook,
				linkX: validatedInput.linkX,
				goal: validatedInput.goal,
				currency: validatedInput.currency,
				additionalAmountChf: validatedInput.additionalAmountChf,
				endDate: validatedInput.endDate,
				isActive: validatedInput.isActive,
				public: validatedInput.public,
				featured: validatedInput.featured,
				slug: validatedInput.slug ?? null,
				metadataDescription: validatedInput.metadataDescription,
				metadataOgImage: validatedInput.metadataOgImage,
				metadataTwitterImage: validatedInput.metadataTwitterImage,
				creatorName: validatedInput.creatorName,
				creatorEmail: validatedInput.creatorEmail,
				organization: { connect: { id: organizationId } },
				program: validatedInput.programId ? { connect: { id: validatedInput.programId } } : undefined,
			};

			const newCampaign = await this.db.campaign.create({
				data: createData,
				include: { program: { select: { id: true, name: true } } },
			});
			return this.resultOk(newCampaign);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not create campaign. Please try again later.');
		}
	}

	async update(userId: string, input: CampaignFormUpdateInput): Promise<ServiceResult<Campaign>> {
		const validatedInputResult = this.campaignValidationService.validateUpdateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			if (accessResult.data.permission !== 'edit') {
				return this.resultFail('No permissions to update campaign');
			}

			const existing = await this.db.campaign.findUnique({
				where: { id: validatedInput.id },
				select: { id: true, title: true, organizationId: true, programId: true },
			});
			if (!existing || existing.organizationId !== accessResult.data.id) {
				return this.resultFail('Permission denied');
			}

			const uniquenessResult = await this.campaignValidationService.validateUpdateUniqueness(validatedInput, {
				campaignId: existing.id,
				existingTitle: existing.title,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			if (validatedInput.programId) {
				const program = await this.db.program.findUnique({
					where: { id: validatedInput.programId },
					select: { id: true },
				});
				if (!program) {
					return this.resultFail('Program not found.');
				}
			}

			const updateData: Prisma.CampaignUpdateInput = {
				title: validatedInput.title,
				description: validatedInput.description,
				secondDescriptionTitle: validatedInput.secondDescriptionTitle,
				secondDescription: validatedInput.secondDescription,
				thirdDescriptionTitle: validatedInput.thirdDescriptionTitle,
				thirdDescription: validatedInput.thirdDescription,
				linkWebsite: validatedInput.linkWebsite,
				linkInstagram: validatedInput.linkInstagram,
				linkTiktok: validatedInput.linkTiktok,
				linkFacebook: validatedInput.linkFacebook,
				linkX: validatedInput.linkX,
				goal: validatedInput.goal,
				currency: validatedInput.currency,
				additionalAmountChf: validatedInput.additionalAmountChf,
				endDate: validatedInput.endDate,
				isActive: validatedInput.isActive,
				public: validatedInput.public,
				featured: validatedInput.featured,
				slug: validatedInput.slug ?? null,
				metadataDescription: validatedInput.metadataDescription,
				metadataOgImage: validatedInput.metadataOgImage,
				metadataTwitterImage: validatedInput.metadataTwitterImage,
				creatorName: validatedInput.creatorName,
				creatorEmail: validatedInput.creatorEmail,
			};
			if (validatedInput.programId !== existing.programId) {
				updateData.program = validatedInput.programId
					? { connect: { id: validatedInput.programId } }
					: { disconnect: true };
			}

			const updatedCampaign = await this.db.campaign.update({
				where: { id: validatedInput.id },
				data: updateData,
			});

			return this.resultOk(updatedCampaign);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not update campaign. Please try again later.');
		}
	}
}
