import type { TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCK = `${BASE}/mock`;
const STORYBLOK_ASSET_HOST_PATTERN = /^https?:\/\/(?:a|img2)\.storyblok\.com\//i;
const STORYBLOK_VIDEO_EXTENSION_PATTERN = /\.(?:mov|mp4|webm|m4v|ogv)(?:\?.*)?$/i;
const STORYBLOK_IMAGE_PLACEHOLDER = '/assets/test/storyblok-image-placeholder.svg';
const STORYBLOK_VIDEO_PLACEHOLDER = '/assets/test/storyblok-video-placeholder.svg';

const normalize = (f: string) => path.basename(f).replace(/\.e2e\.ts$|\.ts$/, '');

const slug = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

const filePath = (t: TestInfo) => {
	const [file, name] = t.titlePath;
	return path.resolve(process.cwd(), 'test/e2e/mock-server/recordings', normalize(file), `${slug(name)}.json`);
};

const sortKeys = (o: Record<string, any>) =>
	Object.fromEntries(
		Object.keys(o)
			.sort()
			.map((k) => [k, o[k]]),
	);

const post = (url: string, body?: unknown) =>
	fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	});

const hideToken = (json: string) => json.replace(/([?&]token=)[^&"]+/gi, '$1__TOKEN__');

const restoreToken = (json: string) =>
	process.env.STORYBLOK_PREVIEW_TOKEN
		? json.replace(/([?&]token=)__TOKEN__/gi, `$1${process.env.STORYBLOK_PREVIEW_TOKEN}`)
		: json;

const replaceStoryblokAssetUrl = (url: string) => {
	if (!STORYBLOK_ASSET_HOST_PATTERN.test(url)) {
		return url;
	}

	return STORYBLOK_VIDEO_EXTENSION_PATTERN.test(url) ? STORYBLOK_VIDEO_PLACEHOLDER : STORYBLOK_IMAGE_PLACEHOLDER;
};

const sanitizeStoryblokAssets = <T>(value: T): T => {
	if (typeof value === 'string') {
		return replaceStoryblokAssetUrl(value) as T;
	}

	if (Array.isArray(value)) {
		return value.map((entry) => sanitizeStoryblokAssets(entry)) as T;
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeStoryblokAssets(entry)])) as T;
	}

	return value;
};

export const setupStoryblokMock = async (testInfo: TestInfo) => {
	const mode = process.env.STORYBLOK_MOCK_MODE;

	if (!mode) {
		return;
	}

	await post(`${MOCK}/reset`);

	if (mode === 'record') {
		await post(`${MOCK}/recordings`, { active: true });
		return;
	}

	if (mode === 'replay') {
		const raw = fs.readFileSync(filePath(testInfo), 'utf-8');
		const recordings = sanitizeStoryblokAssets(JSON.parse(restoreToken(raw)));

		await post(`${MOCK}/recordings`, {
			active: false,
			recordings,
		});
	}
};

export const saveStoryblokMock = async (testInfo: TestInfo) => {
	if (process.env.STORYBLOK_MOCK_MODE !== 'record') {
		return;
	}

	const res = await fetch(`${MOCK}/recordings`);
	const data = sortKeys(await res.json());
	const sanitized = sanitizeStoryblokAssets(data);
	const fp = filePath(testInfo);

	fs.mkdirSync(path.dirname(fp), { recursive: true });

	const json = JSON.stringify(sanitized, null, 2);
	fs.writeFileSync(fp, hideToken(json));
};
