const DEFAULT_PREVIEW_CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_PREVIEW_CACHE_ENTRIES = 500;

type CacheEntry<T> = {
	value: T;
	expiresAt: number;
};

type PreviewCacheStore = Map<string, CacheEntry<unknown>>;

declare global {
	var storyblokPreviewCacheStore: PreviewCacheStore | undefined;
}

const getStore = (): PreviewCacheStore => {
	if (!globalThis.storyblokPreviewCacheStore) {
		globalThis.storyblokPreviewCacheStore = new Map();
	}
	return globalThis.storyblokPreviewCacheStore;
};

const isExpired = (entry: CacheEntry<unknown>) => {
	return entry.expiresAt <= Date.now();
};

const cleanupExpiredEntries = (store: PreviewCacheStore) => {
	for (const [key, entry] of store.entries()) {
		if (isExpired(entry)) {
			store.delete(key);
		}
	}
};

const trimStoreIfNeeded = (store: PreviewCacheStore) => {
	while (store.size >= MAX_PREVIEW_CACHE_ENTRIES) {
		const oldestKey = store.keys().next().value;
		if (oldestKey === undefined) {
			return;
		}
		store.delete(oldestKey);
	}
};

export const buildPreviewCacheKey = (previewToken: string, previewRoutePath: string) => {
	return `${previewToken}_${previewRoutePath}`;
};

export const setPreviewCache = <T>(key: string, value: T, ttlMs = DEFAULT_PREVIEW_CACHE_TTL_MS) => {
	const store = getStore();
	cleanupExpiredEntries(store);
	trimStoreIfNeeded(store);
	store.set(key, {
		value,
		expiresAt: Date.now() + ttlMs,
	});
};

export const getPreviewCache = <T>(key: string): T | undefined => {
	const store = getStore();
	const entry = store.get(key);

	if (!entry) {
		return undefined;
	}

	if (isExpired(entry)) {
		store.delete(key);
		return undefined;
	}

	return entry.value as T;
};
