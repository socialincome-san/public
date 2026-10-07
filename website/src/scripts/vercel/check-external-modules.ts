import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

// Vercel runs functions with `--no-experimental-require-module`, so CommonJS packages that
// Turbopack keeps external must not `require()` ESM-only dependencies. Node 24 allows that
// locally, which hides the problem until the deployment fails at runtime.
const VERCEL_NODE_FLAGS = ['--no-experimental-require-module'];

const nextDir = path.join(process.cwd(), '.next');
const serverDir = path.join(nextDir, 'server');
const externalsDir = path.join(nextDir, 'node_modules');

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listExternalPackageLinks = async () => {
	const entries = await readdir(externalsDir, { withFileTypes: true });
	const scopedEntries = await Promise.all(
		entries
			.filter((entry) => entry.name.startsWith('@'))
			.map(async ({ name: scope }) => (await readdir(path.join(externalsDir, scope))).map((name) => `${scope}/${name}`)),
	);

	return [...entries.filter((entry) => !entry.name.startsWith('@')).map(({ name }) => name), ...scopedEntries.flat()];
};

const findExternalSpecifiers = async (packageLinks: string[]) => {
	const specifierPattern = new RegExp(`["'](${packageLinks.map(escapeRegExp).join('|')})(/[^"'\\s]*)?["']`, 'g');
	const serverFiles = (await readdir(serverDir, { recursive: true })).filter((file) => file.endsWith('.js'));
	const specifiers = new Set<string>();

	for (const file of serverFiles) {
		const source = await readFile(path.join(serverDir, file), 'utf8');
		for (const [, packageLink, subpath = ''] of source.matchAll(specifierPattern)) {
			specifiers.add(`${packageLink}${subpath}`);
		}
	}

	return [...specifiers].sort();
};

const checkExternalModules = async () => {
	const specifiers = await findExternalSpecifiers(await listExternalPackageLinks());
	const failures = specifiers.flatMap((specifier) => {
		const { status, stderr } = spawnSync(
			process.execPath,
			[...VERCEL_NODE_FLAGS, '--input-type=module', '--eval', `await import(${JSON.stringify(specifier)});`],
			{ cwd: serverDir, encoding: 'utf8' },
		);
		console.info(`${status === 0 ? '✓' : '✗'} ${specifier}`);

		return status === 0 ? [] : [{ specifier, stderr }];
	});

	for (const { specifier, stderr } of failures) {
		console.error(`\n${specifier} cannot be loaded with ${VERCEL_NODE_FLAGS.join(' ')}:\n${stderr}`);
	}
	if (failures.length > 0) {
		process.exitCode = 1;
	}
};

void checkExternalModules().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
