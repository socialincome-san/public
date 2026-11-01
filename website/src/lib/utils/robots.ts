// Staging and Vercel previews are publicly reachable and would otherwise be indexed as duplicates of production.
// Read when called: next.config.ts and the robots.txt route run at build time with the deployment's environment.
export const isProductionDeployment = () =>
	// Vercel sets VERCEL_TARGET_ENV itself, so a misconfigured NEXT_PUBLIC_APP_ENVIRONMENT cannot make a preview indexable.
	(process.env.VERCEL_TARGET_ENV ?? process.env.NEXT_PUBLIC_APP_ENVIRONMENT) === 'production';

export const getRobotsHeaders = () =>
	isProductionDeployment() ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
