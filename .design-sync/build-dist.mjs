// Builds design-system/dist/ (gitignored) for /design-sync: the design system
// ships TypeScript source only, but the converter needs a bundled entry and a
// .d.ts tree. Run from the repo root after `npm ci`:
//   node .design-sync/build-dist.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ds = join(root, 'design-system');
const dist = join(ds, 'dist');
const shims = join(root, '.design-sync', 'shims');

const walk = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
	);

const modules = walk(join(ds, 'src', 'components'))
	.filter((p) => /\.tsx?$/.test(p) && !/\.(stories|test)\.tsx?$/.test(p) && !p.endsWith('.d.ts'))
	.sort();

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
writeFileSync(
	join(dist, 'index.ts'),
	modules.map((p) => `export * from './${relative(dist, p).replace(/\.tsx?$/, '')}';`).join('\n') + '\n',
);
writeFileSync(
	join(dist, 'package.json'),
	JSON.stringify(
		{ name: '@socialincome/design-system', version: '0.0.0', type: 'module', module: 'index.js', types: 'types/dist/index.d.ts' },
		null,
		2,
	),
);
writeFileSync(
	join(dist, 'tsconfig.json'),
	JSON.stringify({
		extends: '../tsconfig.json',
		compilerOptions: { noEmit: false, declaration: true, emitDeclarationOnly: true, outDir: 'types', rootDir: '..', types: ['node', 'react'] },
		include: ['index.ts', '../src/css.d.ts'],
	}),
);

await build({
	entryPoints: [join(dist, 'index.ts')],
	outfile: join(dist, 'index.js'),
	bundle: true,
	format: 'esm',
	jsx: 'automatic',
	target: 'es2020',
	logLevel: 'warning',
	external: ['react', 'react-dom', 'react/jsx-runtime', 'react-hook-form'],
	alias: { 'next/link': join(shims, 'next-link.tsx'), 'next/image': join(shims, 'next-image.tsx') },
	loader: { '.css': 'empty' },
});

execFileSync(join(root, 'node_modules', '.bin', 'tsc'), ['-p', join(dist, 'tsconfig.json')], { stdio: 'inherit' });
console.log(`dist: ${modules.length} modules -> ${relative(root, dist)}`);
