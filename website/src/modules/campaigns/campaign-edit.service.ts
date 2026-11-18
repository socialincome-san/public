import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import {
	deleteStoryblokAsset,
	getCampaignStory,
	getStoryblokAsset,
	updatePublishedCampaignStory,
	uploadStoryblokAsset,
} from '@/integrations/storyblok/storyblok-management.integration';
import type { AuditContext } from '@/lib/audit/audit-types';
import { campaignSubmissionConfig } from '@/lib/campaign-submission';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { getCampaignBySlug } from '@/modules/storyblok-content/storyblok-content.cache';
import { format } from 'date-fns';
import { notifyStaffOfCampaignEdit } from './campaign-notification.service';
import { resolveImage } from './campaign-submission.service';
import * as campaignRepository from './campaign.repository.read';
import * as campaignWriteRepository from './campaign.repository.write';
import { isAllowedCurrency, validateCampaignSubmissionEndDate, type CampaignUpdateFields } from './campaign.schemas';
import { getPublicCampaignStatsByIds } from './campaign.service';
import type {
	CampaignSubmissionImageValidation,
	CampaignUpdateImages,
	CampaignUpdateOptionalImage,
	EditableCampaign,
	OwnCampaignListItem,
} from './campaign.types';

const endDateFormat = 'yyyy-MM-dd';

const toImageUrl = (asset: StoryblokAsset | undefined) => asset?.filename ?? null;

export const getOwnCampaigns = async (contributorId: string, language: string): Promise<Result<OwnCampaignListItem[]>> => {
	try {
		const campaigns = await campaignRepository.findCampaignsByContributor(contributorId);
		const [statsResult, storyResults] = await Promise.all([
			getPublicCampaignStatsByIds(campaigns.map((campaign) => campaign.id)),
			Promise.all(
				campaigns.map((campaign) => (campaign.slug ? getCampaignBySlug(campaign.slug, language) : Promise.resolve(null))),
			),
		]);
		const statsById = statsResult.success ? statsResult.data : {};

		const items = campaigns.map((campaign, index): OwnCampaignListItem | null => {
			const storyResult = storyResults[index];
			if (!campaign.slug || !storyResult) {
				return null;
			}

			const content = storyResult.success ? storyResult.data.content : null;
			const stats = statsById[campaign.id];
			const isPublic = content?.public === true;

			return {
				id: campaign.id,
				slug: campaign.slug,
				title: content?.title ?? campaign.slug,
				isPublic,
				isListed: isPublic && content?.approved === true,
				isActive: campaign.endDate.getTime() > Date.now(),
				daysLeft: stats?.daysLeft ?? 0,
				contributionsCount: stats?.contributionsCount ?? 0,
				amountCollected: stats?.amountCollected ?? null,
				goal: campaign.goal === null ? null : Number(campaign.goal),
				currency: campaign.currency,
			};
		});

		return resultOk(items.filter((item) => item !== null));
	} catch (error) {
		console.error(error, { contributorId });

		return resultFail('Could not fetch campaigns');
	}
};

const findOwnCampaign = async (contributorId: string, campaignId: string) => {
	const campaign = await campaignRepository.findCampaignForEdit(campaignId);

	return campaign?.slug && campaign.contributorId === contributorId ? { ...campaign, slug: campaign.slug } : null;
};

export const getOwnCampaignForEdit = async (
	contributorId: string,
	campaignId: string,
): Promise<Result<EditableCampaign>> => {
	try {
		const campaign = await findOwnCampaign(contributorId, campaignId);
		if (!campaign) {
			return resultFail('campaign-not-found', 404);
		}

		const storyResult = await getCampaignStory(campaign.slug);
		if (!storyResult.success) {
			return resultFail('submission-failed', storyResult.status ?? 503);
		}
		if (!storyResult.data) {
			return resultFail('campaign-not-found', 404);
		}
		const { content } = storyResult.data;

		return resultOk({
			id: campaign.id,
			slug: campaign.slug,
			title: content.title,
			description: content.description ?? '',
			goal: campaign.goal === null ? null : Number(campaign.goal),
			currency: isAllowedCurrency(campaign.currency) ? campaign.currency : campaignSubmissionConfig.allowedCurrencies[0],
			endDate: format(campaign.endDate, endDateFormat),
			isPublic: content.public === true,
			creatorName: content.creatorName ?? '',
			quote: content.quote ?? '',
			sectionDescription: content.sectionDescription ?? '',
			instagramHandle: content.instagramHandle ?? '',
			xHandle: content.xHandle ?? '',
			linkWebsite: content.linkWebsite ?? '',
			tiktokHandle: content.tiktokHandle ?? '',
			primaryImageUrl: toImageUrl(content.primaryImage),
			profilePictureUrl: toImageUrl(content.profilePicture),
			sectionImageUrl: toImageUrl(content.sectionImage),
		});
	} catch (error) {
		console.error(error, { contributorId, campaignId });

		return resultFail('submission-failed', 503);
	}
};

type ImageUpdate = { kind: 'keep' } | { kind: 'remove' } | { kind: 'replace'; asset: StoryblokAsset; assetId: number };

const uploadReplacement = async (image: CampaignSubmissionImageValidation, uploadedAssetIds: number[]) => {
	const uploaded = await uploadStoryblokAsset(image.buffer, image.filename, image.mimeType, { focus: image.focus });
	if (!uploaded.success) {
		return uploaded;
	}
	uploadedAssetIds.push(uploaded.data.assetId);

	return resultOk<ImageUpdate>({ kind: 'replace', asset: uploaded.data.asset, assetId: uploaded.data.assetId });
};

const resolveOptionalImageUpdate = async (
	image: CampaignUpdateOptionalImage,
	uploadedAssetIds: number[],
): Promise<Result<ImageUpdate>> =>
	image.kind === 'replace' ? uploadReplacement(image.image, uploadedAssetIds) : resultOk(image);

const resolvePrimaryImageUpdate = async (
	image: CampaignUpdateImages['primaryImage'],
	uploadedAssetIds: number[],
): Promise<Result<ImageUpdate>> => {
	if (image.kind === 'keep') {
		return resultOk(image);
	}

	const resolved = await resolveImage(image);
	if (!resolved.success) {
		return resolved;
	}

	return uploadReplacement(resolved.data, uploadedAssetIds);
};

const applyImageUpdate = (current: StoryblokAsset | undefined, update: ImageUpdate) => {
	if (update.kind === 'keep') {
		return current;
	}

	return update.kind === 'replace' ? update.asset : undefined;
};

const buildUpdatedContent = (
	content: Campaign,
	fields: CampaignUpdateFields,
	images: { primaryImage: ImageUpdate; profilePicture: ImageUpdate; sectionImage: ImageUpdate },
): Campaign => ({
	...content,
	title: fields.title,
	description: fields.description,
	public: fields.public,
	creatorName: fields.creatorName,
	quote: fields.quote,
	primaryImage: applyImageUpdate(content.primaryImage, images.primaryImage) ?? content.primaryImage,
	profilePicture: applyImageUpdate(content.profilePicture, images.profilePicture),
	sectionDescription: fields.sectionDescription ?? undefined,
	sectionImage: fields.hasAdditionalInformation ? applyImageUpdate(content.sectionImage, images.sectionImage) : undefined,
	instagramHandle: fields.instagramHandle ?? undefined,
	xHandle: fields.xHandle ?? undefined,
	linkWebsite: fields.linkWebsite ?? undefined,
	tiktokHandle: fields.tiktokHandle ?? undefined,
});

const storyTextFields = [
	'title',
	'description',
	'creatorName',
	'quote',
	'sectionDescription',
	'instagramHandle',
	'xHandle',
	'linkWebsite',
	'tiktokHandle',
] as const;

const storyImageFields = ['primaryImage', 'profilePicture', 'sectionImage'] as const;

const listChangedFields = (
	before: { content: Campaign; goal: number | null; currency: string; endDate: string },
	after: { content: Campaign; goal: number | null; currency: string; endDate: string },
) => [
	...storyTextFields.filter((field) => (before.content[field] ?? '') !== (after.content[field] ?? '')),
	...((before.content.public === true) !== (after.content.public === true) ? ['public' as const] : []),
	...storyImageFields.filter((field) => before.content[field]?.filename !== after.content[field]?.filename),
	...(['goal', 'currency', 'endDate'] as const).filter((field) => before[field] !== after[field]),
];

// Assets uploaded for campaigns live in their own folder; anything else may be shared with other content.
const deleteReplacedCampaignAssets = async (assetIds: number[]) => {
	await Promise.all(
		assetIds.map(async (assetId) => {
			const assetResult = await getStoryblokAsset(assetId);
			if (
				assetResult.success &&
				assetResult.data?.assetFolderId === campaignSubmissionConfig.storyblokCampaignAssetFolderId
			) {
				await deleteStoryblokAsset(assetId);
			}
		}),
	);
};

export const updateOwnCampaign = async (
	audit: AuditContext,
	contributorId: string,
	campaignId: string,
	fields: CampaignUpdateFields,
	images: CampaignUpdateImages,
): Promise<Result<{ slug: string }>> => {
	const uploadedAssetIds: number[] = [];
	const discardUploads = async () => {
		for (const assetId of uploadedAssetIds) {
			await deleteStoryblokAsset(assetId);
		}
	};

	try {
		const campaign = await findOwnCampaign(contributorId, campaignId);
		if (!campaign) {
			return resultFail('campaign-not-found', 404);
		}

		const previousEndDate = format(campaign.endDate, endDateFormat);
		const endDate = format(fields.endDate, endDateFormat);
		if (endDate !== previousEndDate) {
			const endDateError = validateCampaignSubmissionEndDate(fields.endDate);
			if (endDateError) {
				return resultFail(endDateError, 400);
			}
		}

		const storyResult = await getCampaignStory(campaign.slug);
		if (!storyResult.success) {
			return resultFail('submission-failed', storyResult.status ?? 503);
		}
		if (!storyResult.data) {
			return resultFail('campaign-not-found', 404);
		}
		const { storyId, content, hasUnpublishedChanges } = storyResult.data;

		const [primaryImage, profilePicture, sectionImage] = await Promise.all([
			resolvePrimaryImageUpdate(images.primaryImage, uploadedAssetIds),
			resolveOptionalImageUpdate(images.profilePicture, uploadedAssetIds),
			resolveOptionalImageUpdate(fields.hasAdditionalInformation ? images.sectionImage : { kind: 'keep' }, uploadedAssetIds),
		]);
		if (!primaryImage.success) {
			await discardUploads();

			return resultFail(primaryImage.error, primaryImage.status ?? 503);
		}
		if (!profilePicture.success || !sectionImage.success) {
			await discardUploads();

			return resultFail('submission-failed', 503);
		}

		const updatedContent = buildUpdatedContent(content, fields, {
			primaryImage: primaryImage.data,
			profilePicture: profilePicture.data,
			sectionImage: sectionImage.data,
		});
		const previousGoal = campaign.goal === null ? null : Number(campaign.goal);
		// The form can only offer allowed currencies, so another stored currency stays as it is.
		const currency = isAllowedCurrency(campaign.currency) ? fields.currency : campaign.currency;
		const changedFields = listChangedFields(
			{ content, goal: previousGoal, currency: campaign.currency, endDate: previousEndDate },
			{ content: updatedContent, goal: fields.goal, currency, endDate },
		);
		if (changedFields.length === 0) {
			await discardUploads();

			return resultOk({ slug: campaign.slug });
		}

		const detailsChanged = changedFields.some((field) => field === 'goal' || field === 'currency' || field === 'endDate');
		if (detailsChanged) {
			await campaignWriteRepository.updateCampaignDetails(audit, campaign.id, {
				goal: fields.goal,
				currency,
				// Keeps the stored time of day when only other fields change.
				endDate: endDate === previousEndDate ? campaign.endDate : fields.endDate,
			});
		}

		const updateResult = await updatePublishedCampaignStory(storyId, updatedContent);
		if (!updateResult.success) {
			if (detailsChanged) {
				await campaignWriteRepository.updateCampaignDetails(audit, campaign.id, {
					goal: campaign.goal,
					currency: campaign.currency,
					endDate: campaign.endDate,
				});
			}
			await discardUploads();

			return resultFail('submission-failed', updateResult.status ?? 503);
		}

		const retainedAssetIds = new Set(storyImageFields.map((field) => updatedContent[field]?.id));
		const replacedAssetIds = [
			...new Set(
				storyImageFields.flatMap((field) => {
					const assetId = content[field]?.id;

					return assetId && !retainedAssetIds.has(assetId) ? [assetId] : [];
				}),
			),
		];
		await Promise.all([
			// A language that kept its previous version may still show the replaced images.
			updateResult.data.allLanguagesPublished ? deleteReplacedCampaignAssets(replacedAssetIds) : Promise.resolve(),
			notifyStaffOfCampaignEdit(
				audit,
				{
					id: campaign.id,
					slug: campaign.slug,
					title: updatedContent.title,
					storyId,
					hadUnpublishedChanges: hasUnpublishedChanges,
				},
				changedFields,
			),
		]);

		return resultOk({ slug: campaign.slug });
	} catch (error) {
		await discardUploads();
		console.error(error, { contributorId, campaignId });

		return resultFail('submission-failed', 503);
	}
};
