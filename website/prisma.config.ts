import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

dotenv.config({ path: '.env.development', quiet: true });

export default defineConfig({
	schema: 'src/lib/database/schema.prisma',

	migrations: {
		path: 'src/lib/database/migrations',
		seed: 'tsx src/lib/database/seed/seed.ts',
	},

	datasource: {
		// Migrations need a direct connection; Neon's pooled DATABASE_URL does not support them.
		url: process.env.DATABASE_URL_UNPOOLED ?? env('DATABASE_URL'),
	},
});
