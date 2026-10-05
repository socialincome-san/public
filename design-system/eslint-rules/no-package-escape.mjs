import path from 'node:path';

const designSystemRoot = path.resolve(import.meta.dirname, '..');

const message = 'The design system cannot import the website or files outside this package.';

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

const checkSource = (context, sourceNode) => {
	if (sourceNode?.type !== 'Literal' || typeof sourceNode.value !== 'string') {
		return;
	}

	const source = sourceNode.value;
	if (!isWebsiteAlias(source) && !escapesPackage(context.filename, source)) {
		return;
	}

	context.report({ node: sourceNode, messageId: 'escape' });
};

const noPackageEscape = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow design-system imports that reach the website or leave the package.',
		},
		schema: [],
		messages: {
			escape: message,
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
