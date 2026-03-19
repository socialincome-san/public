import { Campaign, Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { CampaignFormCreateInput, CampaignFormUpdateInput } from './campaign-form-input';
import { CampaignValidationService } from './campaign-validation.service';

export class CampaignWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
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
			const canOperateProgramResult = await this.programAccessService.canOperateProgram(userId, validatedInput.programId);
			if (!canOperateProgramResult.success) {
				return this.resultFail(canOperateProgramResult.error);
			}
			if (!canOperateProgramResult.data) {
				return this.resultFail('No permissions to create campaign');
			}

			const uniquenessResult = await this.campaignValidationService.validateCreateUniqueness(validatedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const program = await this.db.program.findUnique({
				where: { id: validatedInput.programId },
				select: { id: true },
			});
			if (!program) {
				return this.resultFail('Program not found.');
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
				program: { connect: { id: validatedInput.programId } },
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
			const existing = await this.db.campaign.findUnique({
				where: { id: validatedInput.id },
				select: { id: true, title: true, programId: true },
			});
			if (!existing) {
				return this.resultFail('Permission denied');
			}
			const canOperateExistingProgramResult = await this.programAccessService.canOperateProgram(userId, existing.programId);
			if (!canOperateExistingProgramResult.success) {
				return this.resultFail(canOperateExistingProgramResult.error);
			}
			if (!canOperateExistingProgramResult.data) {
				return this.resultFail('No permissions to update campaign');
			}

			const uniquenessResult = await this.campaignValidationService.validateUpdateUniqueness(validatedInput, {
				campaignId: existing.id,
				existingTitle: existing.title,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const targetProgramId = validatedInput.programId ?? existing.programId;
			const program = await this.db.program.findUnique({
				where: { id: targetProgramId },
				select: { id: true },
			});
			if (!program) {
				return this.resultFail('Program not found.');
			}
			const canOperateTargetProgramResult = await this.programAccessService.canOperateProgram(userId, targetProgramId);
			if (!canOperateTargetProgramResult.success) {
				return this.resultFail(canOperateTargetProgramResult.error);
			}
			if (!canOperateTargetProgramResult.data) {
				return this.resultFail('No permissions to update campaign');
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
			if (targetProgramId !== existing.programId) {
				updateData.program = { connect: { id: targetProgramId } };
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
