import crypto from 'crypto';

const PREVIEW_TOKEN_KEYS = ['_storyblok_tk[token]', '_storybloktk[token]'] as const;
const PREVIEW_TIMESTAMP_KEYS = ['_storyblok_tk[timestamp]', '_storybloktk[timestamp]'] as const;
const PREVIEW_TOKEN_MAX_AGE_SECONDS = 60 * 60;

type PreviewSearchParams = Record<string, string | undefined>;

const getFirstValue = (searchParams: PreviewSearchParams, keys: readonly string[]) => {
	for (const key of keys) {
		const value = searchParams[key];
		if (value) {
			return value;
		}
	}
	return undefined;
};

export const getStoryblokPreviewToken = (searchParams: PreviewSearchParams) => {
	const token = getFirstValue(searchParams, PREVIEW_TOKEN_KEYS);
	const timestamp = getFirstValue(searchParams, PREVIEW_TIMESTAMP_KEYS);

	return {
		token,
		timestamp,
	};
};

export const verifyStoryblokPreviewToken = (token?: string, timestamp?: string) => {
	const spaceId = process.env.STORYBLOK_SPACE_ID;
	const draftModeToken = process.env.STORYBLOK_DRAFT_MODE_TOKEN;

	// Keep verification optional so local/dev setups still work without all env vars.
	if (!spaceId || !draftModeToken) {
		return true;
	}

	if (!token || !timestamp) {
		return false;
	}

	const parsedTimestamp = Number.parseInt(timestamp, 10);
	if (Number.isNaN(parsedTimestamp)) {
		return false;
	}

	const validationString = `${spaceId}:${draftModeToken}:${timestamp}`;
	const validationToken = crypto.createHash('sha1').update(validationString).digest('hex');
	const minAllowedTimestamp = Math.floor(Date.now() / 1000) - PREVIEW_TOKEN_MAX_AGE_SECONDS;

	return token === validationToken && parsedTimestamp > minAllowedTimestamp;
};
