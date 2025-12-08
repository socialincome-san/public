import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	ignoreFiles: ['schema.prisma'],
	ignoreDependencies: ['react', 'react-hook-form', 'zod', '@hookform/resolvers'],
};

export default config;
