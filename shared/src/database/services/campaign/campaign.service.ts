import { Campaign } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	CampaignOption,
	CampaignPayload,
	CampaignsCreateInput,
	CampaignsUpdateInput,
	CampaignTableView,
	CampaignTableViewRow,
} from './campaign.types';

export class CampaignService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();

	async get(userId: string, campaignId: string): Promise<ServiceResult<CampaignPayload>> {
		const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

		const { id: organizationId } = accessResult.data;

		try {
			const campaign = await this.db.campaign.findFirst({
				where: { id: campaignId, organizationId },
				select: {
					id: true,
					title: true,
					description: true,
					secondDescriptionTitle: true,
					secondDescription: true,
					thirdDescriptionTitle: true,
					thirdDescription: true,
					linkWebsite: true,
					linkFacebook: true,
					linkInstagram: true,
					goal: true,
					currency: true,
					additionalAmountChf: true,
					endDate: true,
					isActive: true,
					public: true,
					featured: true,
					slug: true,
					metadataDescription: true,
					metadataOgImage: true,
					metadataTwitterImage: true,
					creatorName: true,
					creatorEmail: true,
					program: { select: { id: true, name: true } },
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!campaign) {
				return this.resultFail('Campaign not found');
			}

			// convert decimal fields to number
			return this.resultOk({
				...campaign,
				goal: campaign.goal ? Number(campaign.goal) : null,
				additionalAmountChf: campaign.additionalAmountChf ? Number(campaign.additionalAmountChf) : null,
			});
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch campaign');
		}
	}

	async create(userId: string, campaign: CampaignsCreateInput): Promise<ServiceResult<Campaign>> {
		const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

		if (accessResult.data.permission !== 'edit') {
			return this.resultFail('No permissions to create campaign');
		}

		const { id: organizationId } = accessResult.data;

		try {
			const newCampaign = await this.db.campaign.create({
				data: {
					...campaign,
					organization: { connect: { id: organizationId } },
				},
				include: { program: { select: { id: true, name: true } } },
			});
			return this.resultOk(newCampaign);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not create campaign');
		}
	}

	async update(userId: string, campaign: CampaignsUpdateInput): Promise<ServiceResult<Campaign>> {
		const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

		if (accessResult.data.permission !== 'edit') {
			return this.resultFail('No permissions to create campaign');
		}

		try {
			const updatedCampaign = await this.db.campaign.update({
				where: { id: campaign.id?.toString() },
				data: campaign,
			});

			return this.resultOk(updatedCampaign);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not update campaign');
		}
	}

	async getOptions(userId: string): Promise<ServiceResult<CampaignOption[]>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const campaigns = await this.db.campaign.findMany({
				where: { organizationId: activeOrgResult.data.id },
				select: { id: true, title: true },
				orderBy: { title: 'asc' },
			});

			const options = campaigns.map((campaign) => ({
				id: campaign.id,
				name: campaign.title,
			}));

			return this.resultOk(options);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch campaign options');
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<CampaignTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;

			const campaigns = await this.db.campaign.findMany({
				where: { organizationId },
				select: {
					id: true,
					title: true,
					description: true,
					currency: true,
					endDate: true,
					isActive: true,
					program: { select: { name: true } },
					createdAt: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: CampaignTableViewRow[] = campaigns.map((campaign) => ({
				id: campaign.id,
				title: campaign.title,
				description: campaign.description,
				currency: campaign.currency,
				endDate: campaign.endDate,
				isActive: campaign.isActive,
				programName: campaign.program?.name ?? null,
				createdAt: campaign.createdAt,
				permission,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch campaigns');
		}
	}

	async getFallbackCampaign(): Promise<ServiceResult<Campaign>> {
		try {
			const campaign = await this.db.campaign.findFirst({
				where: {
					isFallback: true,
					isActive: true,
				},
			});

			if (!campaign) {
				return this.resultFail('No fallback campaign found');
			}

			return this.resultOk(campaign);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch default campaign');
		}
	}
}
