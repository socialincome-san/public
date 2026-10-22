import 'server-only';

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Bundled into the route via outputFileTracingIncludes in next.config.ts.
const SCENE_REFERENCES_DIR = join(process.cwd(), 'src/style-references/scenes');
const REFERENCES_PER_IMAGE = 8;

// A fresh random subset per image keeps any single reference from dominating the output.
export const getSceneReferences = async (): Promise<Buffer[]> => {
	const files = await readdir(SCENE_REFERENCES_DIR);
	const picked = files
		.map((file) => ({ file, order: Math.random() }))
		.sort((a, b) => a.order - b.order)
		.slice(0, REFERENCES_PER_IMAGE);
	return Promise.all(picked.map(({ file }) => readFile(join(SCENE_REFERENCES_DIR, file))));
};
