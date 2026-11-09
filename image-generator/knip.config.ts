import { type KnipConfig } from 'knip';

const config: KnipConfig = {
	// Tailwind is used by the Turbopack CSS loader and the shared stylesheet.
	ignoreDependencies: ['tailwindcss'],
};

export default config;
