import { readFileSync } from 'node:fs';
import path from 'node:path';

const fallbackSvgPath = path.join(process.cwd(), 'public/assets/globe/globe-fallback.svg');

export const GlobeFallback = () => {
	const svg = readFileSync(fallbackSvgPath, 'utf8');

	return <div className="size-full" dangerouslySetInnerHTML={{ __html: svg }} />;
};
