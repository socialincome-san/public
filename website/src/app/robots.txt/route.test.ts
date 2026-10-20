import { GET } from './route';

const originalEnv = { ...process.env };

const setDeployment = (env: { NEXT_PUBLIC_APP_ENVIRONMENT?: string; VERCEL_TARGET_ENV?: string }) => {
	delete process.env.NEXT_PUBLIC_APP_ENVIRONMENT;
	delete process.env.VERCEL_TARGET_ENV;
	Object.assign(process.env, env);
};

afterEach(() => {
	process.env = { ...originalEnv };
});

describe('robots.txt', () => {
	it.each([{ NEXT_PUBLIC_APP_ENVIRONMENT: 'production' }, { VERCEL_TARGET_ENV: 'production' }])(
		'keeps the production rules and sitemap in production (%o)',
		async (env) => {
			setDeployment(env);
			const robotsTxt = await GET().text();

			expect(robotsTxt).toMatch(/^User-Agent: \*\nDisallow: \/portal\/\nDisallow: \/partner-space\/\nDisallow: \/api\/\n/);
			expect(robotsTxt).not.toMatch(/^Disallow: \/$/m);
			expect(robotsTxt).toMatch(/\n\nSitemap: https:\/\/www\.socialincome\.org\/sitemap\.xml$/);
		},
	);

	it.each([{ VERCEL_TARGET_ENV: 'staging' }, { VERCEL_TARGET_ENV: 'preview' }, {}])(
		'disallows all crawling outside production (%o)',
		async (env) => {
			setDeployment(env);

			expect(await GET().text()).toBe('User-Agent: *\nDisallow: /');
		},
	);
});
