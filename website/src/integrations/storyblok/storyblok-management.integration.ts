import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getCampaignStoryPath } from '@/lib/storyblok/storyblok-paths';
import { randomUUID } from 'crypto';

const MANAGEMENT_API_BASE = 'https://mapi.storyblok.com/v1';
const MANAGEMENT_FETCH_TIMEOUT_MS = 30_000;
const spaceId = campaignSubmissionConfig.storyblokSpaceId;

type StoryblokManagementError = Error & {
	statusCode: number;
	retryable: boolean;
};

const createStoryblokManagementError = (
	message: string,
	statusCode: number,
	retryable: boolean,
): StoryblokManagementError => {
	const error = new Error(message);
	error.name = 'StoryblokManagementError';

	return Object.assign(error, { statusCode, retryable });
};

const isStoryblokManagementError = (error: unknown): error is StoryblokManagementError => {
	if (!(error instanceof Error) || error.name !== 'StoryblokManagementError') {
		return false;
	}

	return 'statusCode' in error && 'retryable' in error;
};

const toServiceFailure = (error: unknown): ServiceResult<never> => {
	if (isStoryblokManagementError(error)) {
		console.error('Storyblok management request failed', { error });

		return resultFail('Storyblok request failed.', error.retryable ? 503 : error.statusCode);
	}

	console.error(error);

	return resultFail('Storyblok request failed.', 502);
};

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
		throw createStoryblokManagementError('Storyblok management token is not configured.', 503, false);
	}

	return token;
};

const parseManagementResponse = async (response: Response): Promise<unknown> => {
	const text = await response.text();
	if (!text) {
		return null;
	}

	try {
		const parsed: unknown = JSON.parse(text);

		return parsed;
	} catch {
		throw createStoryblokManagementError('Storyblok returned an invalid response.', response.status, response.status >= 500);
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
		throw createStoryblokManagementError('Storyblok request failed.', response.status, retryable);
	}

	return body;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

// `finish_upload` and the single-asset endpoint both return a minimal asset object, sometimes at the
// response root and sometimes nested under `asset`.
const unwrapAsset = (body: unknown): ManagementAsset | null => {
	if (!isObjectRecord(body)) {
		return null;
	}

	const nested = body.asset;
	if (isObjectRecord(nested)) {
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
		throw createStoryblokManagementError('Storyblok asset upload failed.', response.status, response.status >= 500);
	}
};

const isImageAsset = (asset: ManagementAsset): boolean => {
	const contentType = asset.content_type?.toLowerCase() ?? '';
	if (contentType.startsWith('image/')) {
		return campaignSubmissionConfig.permittedImageMimeTypes.some((mimeType) => mimeType === contentType);
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
		throw createStoryblokManagementError('Invalid Storyblok asset URL.', 400, false);
	}

	if (url.protocol !== 'https:') {
		throw createStoryblokManagementError('Storyblok asset URL must use HTTPS.', 400, false);
	}

	if (url.username || url.password) {
		throw createStoryblokManagementError('Storyblok asset URL must not include credentials.', 400, false);
	}

	if (!url.hostname.endsWith('.storyblok.com')) {
		throw createStoryblokManagementError('Storyblok asset URL host is not allowed.', 400, false);
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
			throw createStoryblokManagementError('Storyblok asset exceeds size limit.', 413, false);
		}
	}

	const body = response.body;
	if (!body) {
		const arrayBuffer = await response.arrayBuffer();
		if (arrayBuffer.byteLength > maxBytes) {
			throw createStoryblokManagementError('Storyblok asset exceeds size limit.', 413, false);
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
				throw createStoryblokManagementError('Storyblok asset exceeds size limit.', 413, false);
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

const readManagementAssets = (body: unknown): ManagementAsset[] => {
	if (Array.isArray(body)) {
		return body.filter(isManagementAsset);
	}

	if (isObjectRecord(body) && Array.isArray(body.assets)) {
		return body.assets.filter(isManagementAsset);
	}

	return [];
};

const isManagementAsset = (value: unknown): value is ManagementAsset => isObjectRecord(value);

const isSignedUploadResponse = (value: unknown): value is SignedUploadResponse => {
	if (!isObjectRecord(value)) {
		return false;
	}

	return (
		typeof value.id === 'number' &&
		typeof value.filename === 'string' &&
		typeof value.post_url === 'string' &&
		isObjectRecord(value.fields)
	);
};

const isStoryCreateResponse = (value: unknown): value is StoryCreateResponse => {
	if (!isObjectRecord(value) || !isObjectRecord(value.story)) {
		return false;
	}

	return typeof value.story.id === 'number' && typeof value.story.uuid === 'string';
};

const listAssetsInFolder = async (
	folderId: number,
	options?: { perPage?: number; sortBy?: string },
): Promise<StoryblokListedAsset[]> => {
	const perPage = options?.perPage ?? 25;
	const sortBy = options?.sortBy ?? 'created_at:asc';
	const query = new URLSearchParams({
		in_folder: String(folderId),
		per_page: String(perPage),
		page: '1',
		sort_by: sortBy,
	});

	const body = await requestManagement(`/spaces/${spaceId}/assets/?${query.toString()}`, {
		method: 'GET',
	});

	return readManagementAssets(body).flatMap((asset) => {
		const listed = toListedAsset(asset);

		return listed ? [listed] : [];
	});
};

export const listCampaignDefaultImages = async (
	limit = campaignSubmissionConfig.maxCampaignDefaultImages,
): Promise<ServiceResult<StoryblokListedAsset[]>> => {
	try {
		const assets = await listAssetsInFolder(campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId, {
			perPage: Math.max(limit * 3, 15),
			sortBy: 'created_at:asc',
		});

		return resultOk(assets.slice(0, limit));
	} catch (error) {
		return toServiceFailure(error);
	}
};

export const getStoryblokAsset = async (assetId: number): Promise<ServiceResult<StoryblokListedAsset | null>> => {
	try {
		const body = await requestManagement(`/spaces/${spaceId}/assets/${assetId}`, { method: 'GET' });
		const asset = unwrapAsset(body);
		if (!asset?.id || !asset.filename) {
			return resultOk(null);
		}

		return resultOk({
			id: asset.id,
			filename: asset.filename,
			alt: asset.alt ?? null,
			focus: asset.focus ?? null,
			contentType: asset.content_type ?? null,
			assetFolderId: asset.asset_folder_id ?? null,
		});
	} catch (error) {
		return toServiceFailure(error);
	}
};

export const downloadStoryblokAssetBuffer = async (filename: string): Promise<ServiceResult<Buffer>> => {
	try {
		const assetUrl = assertAllowedStoryblokAssetUrl(filename);
		const response = await fetch(assetUrl, {
			method: 'GET',
			redirect: 'error',
			signal: AbortSignal.timeout(MANAGEMENT_FETCH_TIMEOUT_MS),
		});

		if (!response.ok) {
			throw createStoryblokManagementError('Storyblok asset download failed.', response.status, response.status >= 500);
		}

		return resultOk(await readResponseBodyWithLimit(response, campaignSubmissionConfig.maxImageBytes));
	} catch (error) {
		return toServiceFailure(error);
	}
};

export const uploadStoryblokAsset = async (
	fileBuffer: Buffer,
	filename: string,
	mimeType: string,
	options?: { focus?: string | null },
): Promise<ServiceResult<{ assetId: number; asset: StoryblokAsset }>> => {
	try {
		const signedResponse = await requestManagement(`/spaces/${spaceId}/assets/`, {
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

		if (!isSignedUploadResponse(signedResponse)) {
			throw createStoryblokManagementError('Storyblok did not return a signed upload response.', 502, true);
		}

		const assetId = signedResponse.id;
		try {
			await uploadSignedAsset(signedResponse, fileBuffer, mimeType);

			const finishedAsset = unwrapAsset(
				await requestManagement(`/spaces/${spaceId}/assets/${assetId}/finish_upload`, { method: 'GET' }),
			);

			const resolvedAsset = finishedAsset?.filename
				? finishedAsset
				: unwrapAsset(await requestManagement(`/spaces/${spaceId}/assets/${assetId}`, { method: 'GET' }));

			const assetUrl = resolvedAsset?.filename ?? signedResponse.pretty_url;
			if (!assetUrl) {
				throw createStoryblokManagementError('Storyblok did not return an asset URL after upload.', 502, true);
			}

			const focus = options?.focus?.trim();
			if (focus) {
				await updateAssetFocus(assetId, focus);
			}

			return resultOk({
				assetId,
				asset: {
					id: resolvedAsset?.id ?? assetId,
					filename: assetUrl,
					fieldtype: 'asset',
					alt: resolvedAsset?.alt ?? '',
					name: resolvedAsset?.name ?? '',
					title: resolvedAsset?.title ?? '',
					focus: focus ?? resolvedAsset?.focus ?? '',
					copyright: resolvedAsset?.copyright ?? '',
				},
			});
		} catch (error) {
			await deleteStoryblokAsset(assetId);
			throw error;
		}
	} catch (error) {
		return toServiceFailure(error);
	}
};

const updateAssetFocus = async (assetId: number, focus: string): Promise<void> => {
	await requestManagement(`/spaces/${spaceId}/assets/${assetId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ asset: { focus } }),
	});
};

export const campaignStoryExists = async (slug: string): Promise<ServiceResult<boolean>> => {
	try {
		const storyPath = getCampaignStoryPath(slug);
		const query = new URLSearchParams({ with_slug: storyPath });
		const body = await requestManagement(`/spaces/${spaceId}/stories/?${query.toString()}`, {
			method: 'GET',
		});

		const stories = isObjectRecord(body) && Array.isArray(body.stories) ? body.stories : [];

		return resultOk(
			stories.some((story) => {
				if (!isObjectRecord(story) || story.is_folder) {
					return false;
				}

				return story.full_slug === storyPath || story.slug === slug;
			}),
		);
	} catch (error) {
		return toServiceFailure(error);
	}
};

export type CreatePublishedCampaignStoryInput = {
	slug: string;
	title: string;
	description: string;
	portalSlug: string;
	public: boolean;
	primaryImage: StoryblokAsset;
	creatorName: string;
	quote: string;
	profilePicture?: StoryblokAsset;
	sectionDescription?: string | null;
	sectionImage?: StoryblokAsset;
	instagramHandle?: string | null;
	xHandle?: string | null;
	linkWebsite?: string | null;
	tiktokHandle?: string | null;
};

export const createPublishedCampaignStory = async (
	input: CreatePublishedCampaignStoryInput,
): Promise<ServiceResult<{ storyId: number; storyUuid: string }>> => {
	try {
		const content: Campaign = {
			component: 'Campaign',
			_uid: randomUUID(),
			title: input.title,
			description: input.description,
			portalSlug: input.portalSlug,
			public: input.public,
			primaryImage: input.primaryImage,
			creatorName: input.creatorName,
			quote: input.quote,
			...(input.profilePicture ? { profilePicture: input.profilePicture } : {}),
			...(input.sectionDescription ? { sectionDescription: input.sectionDescription } : {}),
			...(input.sectionImage ? { sectionImage: input.sectionImage } : {}),
			...(input.instagramHandle ? { instagramHandle: input.instagramHandle } : {}),
			...(input.xHandle ? { xHandle: input.xHandle } : {}),
			...(input.linkWebsite ? { linkWebsite: input.linkWebsite } : {}),
			...(input.tiktokHandle ? { tiktokHandle: input.tiktokHandle } : {}),
		};

		const response = await requestManagement(`/spaces/${spaceId}/stories/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				story: {
					name: input.title,
					slug: input.slug,
					parent_id: campaignSubmissionConfig.storyblokCampaignsFolderId || undefined,
					content,
				},
				publish: 1,
			}),
		});

		if (!isStoryCreateResponse(response) || !response.story.id) {
			throw createStoryblokManagementError('Storyblok story creation failed.', 502, true);
		}

		return resultOk({ storyId: response.story.id, storyUuid: response.story.uuid });
	} catch (error) {
		return toServiceFailure(error);
	}
};

export const deleteStoryblokAsset = async (assetId: number): Promise<ServiceResult<void>> => {
	try {
		await requestManagement(`/spaces/${spaceId}/assets/${assetId}`, {
			method: 'DELETE',
		});

		return resultOk(undefined);
	} catch (error) {
		console.error(error, { assetId });

		return resultOk(undefined);
	}
};

export const deleteStoryblokStory = async (storyId: number): Promise<ServiceResult<void>> => {
	try {
		await requestManagement(`/spaces/${spaceId}/stories/${storyId}`, {
			method: 'DELETE',
		});

		return resultOk(undefined);
	} catch (error) {
		console.error(error, { storyId });

		return resultOk(undefined);
	}
};
