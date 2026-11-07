import 'server-only';

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Country } from './countries';

// Bundled into the generate route via outputFileTracingIncludes in next.config.ts.
const STYLE_REFERENCES_DIR = join(process.cwd(), 'src/style-references');
const REFERENCES_PER_IMAGE = 8;

// A fresh random subset per image keeps any single reference, such as one dress pattern, from dominating the output.
export const pickStyleReferences = async (set: Country['styleReferences']): Promise<Buffer[]> => {
	const dir = join(STYLE_REFERENCES_DIR, set);
	const files = (await readdir(dir)).filter((file) => /\.(jpe?g|png|webp)$/i.test(file));
	const picked = files
		.map((file) => ({ file, order: Math.random() }))
		.sort((a, b) => a.order - b.order)
		.slice(0, REFERENCES_PER_IMAGE);

	return Promise.all(picked.map(({ file }) => readFile(join(dir, file))));
};
