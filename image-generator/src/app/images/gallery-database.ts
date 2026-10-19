import { Pool } from 'pg';

export const galleryPool = new Pool({
	connectionString: process.env.DATABASE_URL,
});
