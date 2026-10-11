import { readFileSync } from 'node:fs';
import { isBuiltin } from 'node:module';
import path from 'node:path';

const designSystemRoot = path.resolve(import.meta.dirname, '..');

const {
	name,
	dependencies = {},
	devDependencies = {},
	peerDependencies = {},
} = JSON.parse(readFileSync(path.join(designSystemRoot, 'package.json'), 'utf8'));
const declaredPackages = new Set([
	name,
	...Object.keys(dependencies),
	...Object.keys(devDependencies),
	...Object.keys(peerDependencies),
]);

const isWebsiteAlias = (source) =>
	source.startsWith('@/') || source === '@socialincome/website' || source.startsWith('@socialincome/website/');

const escapesPackage = (filename, source) => {
	if (!source.startsWith('.')) {
		return false;
	}

	const resolved = path.resolve(path.dirname(filename), source);
	const relative = path.relative(designSystemRoot, resolved);

	return relative.startsWith('..') || path.isAbsolute(relative);
};

const getPackageName = (source) => {
	const [scopeOrName, scopedName] = source.split('/');

	return source.startsWith('@') ? `${scopeOrName}/${scopedName}` : scopeOrName;
};

const isUndeclaredPackage = (source) =>
	!source.startsWith('.') && !path.isAbsolute(source) && !isBuiltin(source) && !declaredPackages.has(getPackageName(source));

const checkSource = (context, sourceNode) => {
	if (sourceNode?.type !== 'Literal' || typeof sourceNode.value !== 'string') {
		return;
	}

	const source = sourceNode.value;
	if (isWebsiteAlias(source) || escapesPackage(context.filename, source)) {
		context.report({ node: sourceNode, messageId: 'escape' });
	} else if (isUndeclaredPackage(source)) {
		context.report({ node: sourceNode, messageId: 'undeclared', data: { packageName: getPackageName(source) } });
	}
};

const noPackageEscape = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow design-system imports that reach the website, leave the package, or use undeclared packages.',
		},
		schema: [],
		messages: {
			escape: 'The design system cannot import the website or files outside this package.',
			undeclared:
				'"{{packageName}}" is not declared in design-system/package.json. Website dependencies are not available to the design system.',
		},
	},
	create: (context) => ({
		ImportDeclaration: (node) => checkSource(context, node.source),
		ExportAllDeclaration: (node) => checkSource(context, node.source),
		ExportNamedDeclaration: (node) => checkSource(context, node.source),
		ImportExpression: (node) => checkSource(context, node.source),
	}),
};

export default {
	rules: {
		'no-package-escape': noPackageEscape,
	},
};
