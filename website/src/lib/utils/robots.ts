// Staging and Vercel previews are publicly reachable and would otherwise be indexed as duplicates of production.
// Read when called: next.config.ts and the robots.txt route run at build time with the deployment's environment.
export const isProductionDeployment = () =>
	(process.env.NEXT_PUBLIC_APP_ENVIRONMENT ?? process.env.VERCEL_TARGET_ENV) === 'production';

export const getRobotsHeaders = () =>
	isProductionDeployment() ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
