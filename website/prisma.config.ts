import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

export default defineConfig({
	schema: 'src/lib/database/schema.prisma',

	migrations: {
		path: 'src/lib/database/migrations',
		seed: 'tsx src/lib/database/seed/seed.ts',
	},

	datasource: {
		url: env('DATABASE_URL'),
	},
});
