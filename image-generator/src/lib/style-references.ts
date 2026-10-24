import 'server-only';

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Bundled into the route via outputFileTracingIncludes in next.config.ts.
const SCENE_REFERENCES_DIR = join(process.cwd(), 'src/style-references/scenes');
// Global scenes only use people with light skin; the West African scenes would pull them toward West Africa.
const LIGHT_SKIN_REFERENCES_DIR = join(process.cwd(), 'src/style-references/light-skin');
const REFERENCES_PER_IMAGE = 8;

// A fresh random subset per image keeps any single reference from dominating the output.
export const getSceneReferences = async (country: string): Promise<Buffer[]> => {
	const dir = country === 'global' ? LIGHT_SKIN_REFERENCES_DIR : SCENE_REFERENCES_DIR;
	const files = await readdir(dir);
	const picked = files
		.map((file) => ({ file, order: Math.random() }))
		.sort((a, b) => a.order - b.order)
		.slice(0, REFERENCES_PER_IMAGE);
	return Promise.all(picked.map(({ file }) => readFile(join(dir, file))));
};
