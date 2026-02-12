import type { TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCK = `${BASE}/mock`;

const normalize = (f: string) => path.basename(f).replace(/\.e2e\.ts$|\.ts$/, '');

const slug = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

const filePath = (t: TestInfo) => {
	const [file, name] = t.titlePath;
	return path.resolve(process.cwd(), 'test/e2e/recordings', normalize(file), `${slug(name)}.json`);
};

const sortKeys = (o: Record<string, any>) =>
	Object.fromEntries(
		Object.keys(o)
			.sort()
			.map((k) => [k, o[k]]),
	);

const post = (url: string, body?: any) =>
	fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	});

export async function setupStoryblokMock(testInfo: TestInfo) {
	const mode = process.env.STORYBLOK_MOCK_MODE;
	if (!mode) return;

	await post(`${MOCK}/reset`);

	mode === 'record' &&
		(await post(`${MOCK}/recordings`, {
			active: true,
			deleteHeadersForHash: ['authorization', 'cookie', 'set-cookie', 'x-middleware-set-cookie', 'content-length'],
			failedRequestsResponse: { error: 'Unexpected external Storyblok call in replay mode' },
		}));

	mode === 'replay' &&
		(await post(`${MOCK}/recordings`, {
			active: false,
			recordings: JSON.parse(fs.readFileSync(filePath(testInfo), 'utf-8')),
			failedRequestsResponse: { error: 'Missing Storyblok recording in replay mode' },
		}));
}

export async function saveStoryblokMock(testInfo: TestInfo) {
	if (process.env.STORYBLOK_MOCK_MODE !== 'record') return;

	const res = await fetch(`${MOCK}/recordings`);
	const data = sortKeys(await res.json());
	const fp = filePath(testInfo);

	fs.mkdirSync(path.dirname(fp), { recursive: true });
	fs.writeFileSync(fp, JSON.stringify(data, null, 2));
}
