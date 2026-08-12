import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { logger } from '@/lib/utils/logger';
import { randomUUID } from 'crypto';

const MANAGEMENT_API_BASE = 'https://mapi.storyblok.com/v1';
const MANAGEMENT_FETCH_TIMEOUT_MS = 30_000;

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
	asset_folder_id?: number | null;
	content_type?: string | null;
};

export type StoryblokListedAsset = {
	id: number;
	filename: string;
	alt: string | null;
	focus: string | null;
	contentType: string | null;
	assetFolderId: number | null;
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
	const token = process.env.STORYBLOK_MANAGEMENT_TOKEN?.trim();
	if (!token) {
		throw new StoryblokManagementError('Storyblok management token is not configured.', 503, false);
	}

	return token;
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
		signal: AbortSignal.timeout(MANAGEMENT_FETCH_TIMEOUT_MS),
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
		signal: AbortSignal.timeout(MANAGEMENT_FETCH_TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new StoryblokManagementError('Storyblok asset upload failed.', response.status, response.status >= 500);
	}
};

const isImageAsset = (asset: ManagementAsset): boolean => {
	const contentType = asset.content_type?.toLowerCase() ?? '';
	if (contentType.startsWith('image/')) {
		return campaignSubmissionConfig.permittedImageMimeTypes.includes(
			contentType as (typeof campaignSubmissionConfig.permittedImageMimeTypes)[number],
		);
	}

	const filename = asset.filename?.toLowerCase() ?? '';

	return /\.(jpe?g|png|webp)(\?|$)/.test(filename);
};

/** Restrict asset downloads to HTTPS hosts under *.storyblok.com (e.g. a.storyblok.com). */
const assertAllowedStoryblokAssetUrl = (filename: string): string => {
	let url: URL;
	try {
		url = new URL(filename);
	} catch {
		throw new StoryblokManagementError('Invalid Storyblok asset URL.', 400, false);
	}

	if (url.protocol !== 'https:') {
		throw new StoryblokManagementError('Storyblok asset URL must use HTTPS.', 400, false);
	}

	if (url.username || url.password) {
		throw new StoryblokManagementError('Storyblok asset URL must not include credentials.', 400, false);
	}

	if (!url.hostname.endsWith('.storyblok.com')) {
		throw new StoryblokManagementError('Storyblok asset URL host is not allowed.', 400, false);
	}

	return url.href;
};

/**
 * Drains a fetch response with a hard byte cap. Content-Length is a fast-path reject only;
 * the stream itself is still bounded so missing/lying headers cannot force unbounded buffering.
 */
const readResponseBodyWithLimit = async (response: Response, maxBytes: number): Promise<Buffer> => {
	const contentLengthHeader = response.headers.get('content-length');
	if (contentLengthHeader !== null) {
		const contentLength = Number(contentLengthHeader);
		if (Number.isFinite(contentLength) && contentLength > maxBytes) {
			throw new StoryblokManagementError('Storyblok asset exceeds size limit.', 413, false);
		}
	}

	const body = response.body;
	if (!body) {
		const arrayBuffer = await response.arrayBuffer();
		if (arrayBuffer.byteLength > maxBytes) {
			throw new StoryblokManagementError('Storyblok asset exceeds size limit.', 413, false);
		}

		return Buffer.from(arrayBuffer);
	}

	const reader = body.getReader();
	const chunks: Uint8Array[] = [];
	let totalBytes = 0;

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}

			totalBytes += value.byteLength;
			if (totalBytes > maxBytes) {
				await reader.cancel();
				throw new StoryblokManagementError('Storyblok asset exceeds size limit.', 413, false);
			}

			chunks.push(value);
		}
	} finally {
		try {
			reader.releaseLock();
		} catch {
			// Stream may already be cancelled or released.
		}
	}

	return Buffer.concat(chunks, totalBytes);
};

const toListedAsset = (asset: ManagementAsset): StoryblokListedAsset | null => {
	if (!asset.id || !asset.filename || !isImageAsset(asset)) {
		return null;
	}

	return {
		id: asset.id,
		filename: asset.filename,
		alt: asset.alt ?? null,
		focus: asset.focus ?? null,
		contentType: asset.content_type ?? null,
		assetFolderId: asset.asset_folder_id ?? null,
	};
};

export class StoryblokManagementService {
	private readonly spaceId = campaignSubmissionConfig.storyblokSpaceId;

	async listAssetsInFolder(
		folderId: number,
		options?: { perPage?: number; sortBy?: string },
	): Promise<StoryblokListedAsset[]> {
		const perPage = options?.perPage ?? 25;
		const sortBy = options?.sortBy ?? 'created_at:asc';
		const query = new URLSearchParams({
			in_folder: String(folderId),
			per_page: String(perPage),
			page: '1',
			sort_by: sortBy,
		});

		const body = await requestManagement(`/spaces/${this.spaceId}/assets/?${query.toString()}`, {
			method: 'GET',
		});

		const assets = Array.isArray((body as { assets?: unknown })?.assets)
			? ((body as { assets: ManagementAsset[] }).assets ?? [])
			: Array.isArray(body)
				? (body as ManagementAsset[])
				: [];

		return assets.flatMap((asset) => {
			const listed = toListedAsset(asset);

			return listed ? [listed] : [];
		});
	}

	async listCampaignDefaultImages(
		limit = campaignSubmissionConfig.maxCampaignDefaultImages,
	): Promise<StoryblokListedAsset[]> {
		// Fetch extra rows so non-image assets can be filtered out before applying the gallery cap.
		const assets = await this.listAssetsInFolder(campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId, {
			perPage: Math.max(limit * 3, 15),
			sortBy: 'created_at:asc',
		});

		return assets.slice(0, limit);
	}

	async getAsset(assetId: number): Promise<StoryblokListedAsset | null> {
		const body = await requestManagement(`/spaces/${this.spaceId}/assets/${assetId}`, { method: 'GET' });
		const asset = unwrapAsset(body);
		if (!asset?.id || !asset.filename) {
			return null;
		}

		return {
			id: asset.id,
			filename: asset.filename,
			alt: asset.alt ?? null,
			focus: asset.focus ?? null,
			contentType: asset.content_type ?? null,
			assetFolderId: asset.asset_folder_id ?? null,
		};
	}

	async downloadAssetBuffer(filename: string): Promise<Buffer> {
		const assetUrl = assertAllowedStoryblokAssetUrl(filename);
		const response = await fetch(assetUrl, {
			method: 'GET',
			redirect: 'error',
			signal: AbortSignal.timeout(MANAGEMENT_FETCH_TIMEOUT_MS),
		});

		if (!response.ok) {
			throw new StoryblokManagementError('Storyblok asset download failed.', response.status, response.status >= 500);
		}

		return readResponseBodyWithLimit(response, campaignSubmissionConfig.maxImageBytes);
	}

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

		const assetId = signed.id;
		try {
			await uploadSignedAsset(signed, fileBuffer, mimeType);

			const finishedAsset = unwrapAsset(
				await requestManagement(`/spaces/${this.spaceId}/assets/${assetId}/finish_upload`, { method: 'GET' }),
			);

			// The minimal asset from `finish_upload` may omit the CDN filename that asset fields require.
			const resolvedAsset = finishedAsset?.filename
				? finishedAsset
				: unwrapAsset(await requestManagement(`/spaces/${this.spaceId}/assets/${assetId}`, { method: 'GET' }));

			const assetUrl = resolvedAsset?.filename ?? signed.pretty_url;
			if (!assetUrl) {
				throw new StoryblokManagementError('Storyblok did not return an asset URL after upload.', 502, true);
			}

			return {
				assetId,
				asset: {
					id: resolvedAsset?.id ?? assetId,
					filename: assetUrl,
					fieldtype: 'asset',
					alt: resolvedAsset?.alt ?? '',
					name: resolvedAsset?.name ?? '',
					title: resolvedAsset?.title ?? '',
					focus: resolvedAsset?.focus ?? '',
					copyright: resolvedAsset?.copyright ?? '',
				},
			};
		} catch (error) {
			await this.deleteAsset(assetId);
			throw error;
		}
	}

	async createPublishedCampaignStory(input: {
		slug: string;
		title: string;
		description: string;
		portalSlug: string;
		primaryImage: StoryblokAsset;
		creatorName: string;
		quote: string;
		profilePicture?: StoryblokAsset;
		sectionDescription?: string | null;
		sectionImage?: StoryblokAsset;
		linkInstagram?: string | null;
		linkX?: string | null;
		linkWebsite?: string | null;
		linkTiktok?: string | null;
	}): Promise<{ storyId: number; storyUuid: string }> {
		const content: Campaign = {
			component: 'Campaign',
			_uid: randomUUID(),
			title: input.title,
			description: input.description,
			portalSlug: input.portalSlug,
			primaryImage: input.primaryImage,
			creatorName: input.creatorName,
			quote: input.quote,
			...(input.profilePicture ? { profilePicture: input.profilePicture } : {}),
			...(input.sectionDescription ? { sectionDescription: input.sectionDescription } : {}),
			...(input.sectionImage ? { sectionImage: input.sectionImage } : {}),
			...(input.linkInstagram ? { linkInstagram: input.linkInstagram } : {}),
			...(input.linkX ? { linkX: input.linkX } : {}),
			...(input.linkWebsite ? { linkWebsite: input.linkWebsite } : {}),
			...(input.linkTiktok ? { linkTiktok: input.linkTiktok } : {}),
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
}

export const isStoryblokManagementError = (error: unknown): error is StoryblokManagementError =>
	error instanceof StoryblokManagementError;
