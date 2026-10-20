import { getRobotsHeaders } from './robots';

const originalEnv = { ...process.env };

const setDeployment = (env: { NEXT_PUBLIC_APP_ENVIRONMENT?: string; VERCEL_TARGET_ENV?: string }) => {
	delete process.env.NEXT_PUBLIC_APP_ENVIRONMENT;
	delete process.env.VERCEL_TARGET_ENV;
	Object.assign(process.env, env);
};

afterEach(() => {
	process.env = { ...originalEnv };
});

describe('getRobotsHeaders', () => {
	it.each([{ NEXT_PUBLIC_APP_ENVIRONMENT: 'production' }, { VERCEL_TARGET_ENV: 'production' }])(
		'adds no X-Robots-Tag header in production (%o)',
		(env) => {
			setDeployment(env);

			expect(getRobotsHeaders()).toEqual([]);
		},
	);

	it.each([{ VERCEL_TARGET_ENV: 'staging' }, { VERCEL_TARGET_ENV: 'preview' }, {}])(
		'marks every response noindex, nofollow outside production (%o)',
		(env) => {
			setDeployment(env);

			expect(getRobotsHeaders()).toEqual([{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]);
		},
	);
});
