import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { getCampaignStoryPath } from '@/lib/storyblok/storyblok-paths';
import { logger } from '@/lib/utils/logger';
import { randomUUID } from 'crypto';

const MANAGEMENT_API_BASE = 'https://mapi.storyblok.com/v1';

export class StoryblokManagementError extends Error {
	constructor(
		message: string,
		readonly statusCode: number,
		readonly retryable: boolean,
	) {
		super(message);
		this.name = 'StoryblokManagementError';
	}
}

type SignedUploadResponse = {
	id: number;
	filename: string;
	post_url: string;
	fields: Record<string, string>;
	pretty_url?: string;
	public_url?: string;
};

type ManagementAsset = {
	id?: number;
	filename?: string | null;
	alt?: string | null;
	title?: string | null;
	copyright?: string | null;
	focus?: string | null;
	name?: string | null;
};

type StoryCreateResponse = {
	story: {
		id: number;
		uuid: string;
		slug: string;
		full_slug: string;
	};
};

const getManagementToken = (): string => {
	const token = process.env.STORYBLOK_MANAGEMENT_TOKEN ?? process.env.STORYBLOK_PERSONAL_ACCESS_TOKEN;
	if (!token?.trim()) {
		throw new StoryblokManagementError('Storyblok management token is not configured.', 503, false);
	}

	return token.trim();
};

const parseManagementResponse = async (response: Response): Promise<unknown> => {
	const text = await response.text();
	if (!text) {
		return null;
	}

	try {
		return JSON.parse(text) as unknown;
	} catch {
		throw new StoryblokManagementError('Storyblok returned an invalid response.', response.status, response.status >= 500);
	}
};

const requestManagement = async (path: string, init: RequestInit): Promise<unknown> => {
	const token = getManagementToken();
	const response = await fetch(`${MANAGEMENT_API_BASE}${path}`, {
		...init,
		headers: {
			Authorization: token,
			...(init.headers ?? {}),
		},
	});

	const body = await parseManagementResponse(response);
	if (!response.ok) {
		const retryable = response.status === 429 || response.status >= 500;
		throw new StoryblokManagementError('Storyblok request failed.', response.status, retryable);
	}

	return body;
};

// `finish_upload` and the single-asset endpoint both return a minimal asset object, sometimes at the
// response root and sometimes nested under `asset`.
const unwrapAsset = (body: unknown): ManagementAsset | null => {
	if (!body || typeof body !== 'object') {
		return null;
	}

	const nested = (body as { asset?: unknown }).asset;
	if (nested && typeof nested === 'object') {
		return nested;
	}

	return body;
};

const uploadSignedAsset = async (signed: SignedUploadResponse, fileBuffer: Buffer, mimeType: string): Promise<void> => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(signed.fields)) {
		formData.append(key, value);
	}
	formData.append('file', new Blob([new Uint8Array(fileBuffer)], { type: mimeType }), signed.filename);

	const response = await fetch(signed.post_url, {
		method: 'POST',
		body: formData,
	});

	if (!response.ok) {
		throw new StoryblokManagementError('Storyblok asset upload failed.', response.status, response.status >= 500);
	}
};

export class StoryblokManagementService {
	private readonly spaceId = campaignSubmissionConfig.storyblokSpaceId;

	async uploadAsset(
		fileBuffer: Buffer,
		filename: string,
		mimeType: string,
	): Promise<{ assetId: number; asset: StoryblokAsset }> {
		const signedResponse = await requestManagement(`/spaces/${this.spaceId}/assets/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				filename,
				validate_upload: 1,
				...(campaignSubmissionConfig.storyblokCampaignAssetFolderId
					? { asset_folder_id: campaignSubmissionConfig.storyblokCampaignAssetFolderId }
					: {}),
			}),
		});

		const signed = signedResponse as SignedUploadResponse;
		if (!signed?.post_url || !signed.fields || !signed.id) {
			throw new StoryblokManagementError('Storyblok did not return a signed upload response.', 502, true);
		}

		await uploadSignedAsset(signed, fileBuffer, mimeType);

		const finishedAsset = unwrapAsset(
			await requestManagement(`/spaces/${this.spaceId}/assets/${signed.id}/finish_upload`, { method: 'GET' }),
		);

		// The minimal asset from `finish_upload` may omit the CDN filename that asset fields require.
		const resolvedAsset = finishedAsset?.filename
			? finishedAsset
			: unwrapAsset(await requestManagement(`/spaces/${this.spaceId}/assets/${signed.id}`, { method: 'GET' }));

		const assetUrl = resolvedAsset?.filename ?? signed.pretty_url;
		if (!assetUrl) {
			throw new StoryblokManagementError('Storyblok did not return an asset URL after upload.', 502, true);
		}

		return {
			assetId: signed.id,
			asset: {
				id: resolvedAsset?.id ?? signed.id,
				filename: assetUrl,
				fieldtype: 'asset',
				alt: resolvedAsset?.alt ?? '',
				name: resolvedAsset?.name ?? '',
				title: resolvedAsset?.title ?? '',
				focus: resolvedAsset?.focus ?? '',
				copyright: resolvedAsset?.copyright ?? '',
			},
		};
	}

	async createDraftCampaignStory(input: {
		slug: string;
		title: string;
		description: string;
		portalSlug: string;
		primaryImage: StoryblokAsset;
	}): Promise<{ storyId: number; storyUuid: string }> {
		const content: Campaign = {
			component: 'Campaign',
			_uid: randomUUID(),
			title: input.title,
			description: input.description,
			portalSlug: input.portalSlug,
			primaryImage: input.primaryImage,
		};

		const response = await requestManagement(`/spaces/${this.spaceId}/stories/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				story: {
					name: input.title,
					slug: input.slug,
					parent_id: campaignSubmissionConfig.storyblokCampaignsFolderId || undefined,
					content,
				},
				publish: 0,
			}),
		});

		const story = (response as StoryCreateResponse).story;
		if (!story?.id) {
			throw new StoryblokManagementError('Storyblok story creation failed.', 502, true);
		}

		return { storyId: story.id, storyUuid: story.uuid };
	}

	async deleteAsset(assetId: number): Promise<void> {
		try {
			await requestManagement(`/spaces/${this.spaceId}/assets/${assetId}`, {
				method: 'DELETE',
			});
		} catch (error) {
			logger.error(error, { assetId });
		}
	}

	async deleteStory(storyId: number): Promise<void> {
		try {
			await requestManagement(`/spaces/${this.spaceId}/stories/${storyId}`, {
				method: 'DELETE',
			});
		} catch (error) {
			logger.error(error, { storyId });
		}
	}

	getStoryPathForSlug(slug: string): string {
		return getCampaignStoryPath(slug);
	}
}

export const isStoryblokManagementError = (error: unknown): error is StoryblokManagementError =>
	error instanceof StoryblokManagementError;
