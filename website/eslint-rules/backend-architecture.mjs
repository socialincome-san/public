import path from 'node:path';

const isUseServerDirective = (statement) => {
	if (statement?.type !== 'ExpressionStatement') {
		return false;
	}

	const { expression } = statement;
	return expression?.type === 'Literal' && expression.value === 'use server';
};

const getExportedVariableDeclarators = (node) => {
	if (node.declaration?.type !== 'VariableDeclaration') {
		return [];
	}

	return node.declaration.declarations;
};

const isFunctionExpression = (node) => node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression';

const typeNodeText = (sourceCode, typeNode) => {
	if (!typeNode) {
		return '';
	}

	return sourceCode.getText(typeNode).replace(/\s+/g, '');
};

const isResultTypeAnnotation = (sourceCode, typeNode) => {
	const text = typeNodeText(sourceCode, typeNode);
	return /^Result<.+>$/.test(text) || /^Promise<Result<.+>>$/.test(text);
};

const findVariable = (scope, name) => {
	for (let currentScope = scope; currentScope; currentScope = currentScope.upper) {
		const variable = currentScope.variables.find((candidate) => candidate.name === name);
		if (variable) {
			return variable;
		}
	}

	return null;
};

const isStaticResultError = (sourceCode, node, visitedVariables = new Set()) => {
	if (node?.type === 'Literal') {
		return typeof node.value === 'string';
	}

	if (node?.type === 'TemplateLiteral') {
		return node.expressions.length === 0;
	}

	if (node?.type === 'TSAsExpression') {
		return isStaticResultError(sourceCode, node.expression, visitedVariables);
	}

	if (node?.type === 'ConditionalExpression') {
		return (
			isStaticResultError(sourceCode, node.consequent, visitedVariables) &&
			isStaticResultError(sourceCode, node.alternate, visitedVariables)
		);
	}

	if (node?.type !== 'Identifier') {
		return false;
	}

	const variable = findVariable(sourceCode.getScope(node), node.name);
	const definition = variable?.defs.length === 1 ? variable.defs[0] : null;
	if (
		!variable ||
		visitedVariables.has(variable) ||
		definition?.type !== 'Variable' ||
		definition.parent?.kind !== 'const' ||
		!definition.node.init
	) {
		return false;
	}

	visitedVariables.add(variable);
	return isStaticResultError(sourceCode, definition.node.init, visitedVariables);
};

const isUnsafeResultError = (sourceCode, node) => {
	if (isStaticResultError(sourceCode, node)) {
		return false;
	}

	if (node?.type === 'TemplateLiteral' || node?.type === 'BinaryExpression' || node?.type === 'CallExpression') {
		return true;
	}

	if (node?.type === 'ConditionalExpression') {
		return isUnsafeResultError(sourceCode, node.consequent) || isUnsafeResultError(sourceCode, node.alternate);
	}

	if (node?.type === 'LogicalExpression') {
		return isUnsafeResultError(sourceCode, node.left) || isUnsafeResultError(sourceCode, node.right);
	}

	if (node?.type === 'ChainExpression' || node?.type === 'TSAsExpression') {
		return isUnsafeResultError(sourceCode, node.expression);
	}

	if (node?.type === 'Identifier') {
		return node.name === 'error' || node.name === 'errors';
	}

	return (
		node?.type === 'MemberExpression' &&
		((node.property.type === 'Identifier' && node.property.name === 'message') ||
			(node.property.type === 'Literal' && node.property.value === 'message'))
	);
};

const isResultFailCall = (node) => {
	if (node.type !== 'CallExpression') {
		return false;
	}

	if (node.callee?.type === 'Identifier' && node.callee.name === 'resultFail') {
		return true;
	}

	return (
		node.callee?.type === 'MemberExpression' &&
		node.callee.property?.type === 'Identifier' &&
		node.callee.property.name === 'resultFail'
	);
};

const normalizePath = (filename) => {
	const normalized = filename.replaceAll('\\', '/');
	return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

const getModuleNameFromPath = (filename) => {
	const match = normalizePath(filename).match(/\/src\/modules\/([^/]+)\//);
	return match?.[1] ?? null;
};

const isAllowedModuleFilename = (filename) => {
	const normalized = normalizePath(filename);
	if (!normalized.includes('/src/modules/')) {
		return true;
	}

	return (
		/\.actions\.tsx?$/.test(normalized) ||
		/\.service\.tsx?$/.test(normalized) ||
		/\.cache\.tsx?$/.test(normalized) ||
		/\.repository\.tsx?$/.test(normalized) ||
		/\.schemas\.tsx?$/.test(normalized) ||
		/\.permissions\.tsx?$/.test(normalized) ||
		/\.types\.tsx?$/.test(normalized) ||
		/\.test\.tsx?$/.test(normalized)
	);
};

const isAllowedIntegrationFilename = (filename) => {
	const normalized = normalizePath(filename);
	if (!normalized.includes('/src/integrations/')) {
		return true;
	}

	return /\.integration\.tsx?$/.test(normalized) || /\.test\.tsx?$/.test(normalized);
};

const isUnknownOrFormDataType = (sourceCode, typeNode) => {
	if (!typeNode) {
		return false;
	}

	if (typeNode.type === 'TSUnknownKeyword') {
		return true;
	}

	const text = typeNodeText(sourceCode, typeNode);
	return text === 'FormData' || text === 'unknown';
};

const getParamTypeNode = (param) => {
	const target = param.type === 'AssignmentPattern' ? param.left : param;
	return target.typeAnnotation?.typeAnnotation ?? null;
};

const actionFileContract = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require Server Action files to use the module action contract.',
		},
		schema: [],
		messages: {
			missingUseServer: "Server Action files must start with 'use server'.",
			namedFunctionsOnly: 'Server Action files may only export named functions.',
			noDefaultExport: 'Server Action files must use named exports.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		if (!filename.endsWith('.actions.ts') && !filename.endsWith('.actions.tsx')) {
			return {};
		}

		return {
			Program(node) {
				const firstStatement = node.body.find((statement) => statement.type !== 'ImportDeclaration');
				if (!isUseServerDirective(firstStatement)) {
					context.report({ node, messageId: 'missingUseServer' });
				}
			},
			ExportDefaultDeclaration(node) {
				context.report({ node, messageId: 'noDefaultExport' });
			},
			ExportNamedDeclaration(node) {
				if (node.exportKind === 'type') {
					return;
				}

				if (node.source || node.specifiers.length > 0) {
					for (const specifier of node.specifiers) {
						if (specifier.exportKind === 'type') {
							continue;
						}

						context.report({ node: specifier, messageId: 'namedFunctionsOnly' });
					}

					if (node.specifiers.length > 0) {
						return;
					}
				}

				if (!node.declaration) {
					return;
				}

				if (node.declaration.type === 'TSDeclareFunction' || node.declaration.type === 'TSTypeAliasDeclaration') {
					return;
				}

				if (node.declaration.type === 'FunctionDeclaration') {
					return;
				}

				const declarators = getExportedVariableDeclarators(node);
				if (declarators.length === 0) {
					context.report({ node, messageId: 'namedFunctionsOnly' });
					return;
				}

				for (const declarator of declarators) {
					if (!isFunctionExpression(declarator.init)) {
						context.report({ node: declarator, messageId: 'namedFunctionsOnly' });
					}
				}
			},
		};
	},
};

const resultContract = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require exported service, cache, action, and integration functions to return Result.',
		},
		schema: [
			{
				type: 'object',
				properties: {
					allowSyncWithoutResult: { type: 'boolean' },
				},
				additionalProperties: false,
			},
		],
		messages: {
			missingResultType:
				'Exported functions in services, caches, actions, and integrations must declare Result<T> or Promise<Result<T>> return types.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		const isServiceFile = filename.endsWith('.service.ts') || filename.endsWith('.service.tsx');
		const isActionFile = filename.endsWith('.actions.ts') || filename.endsWith('.actions.tsx');
		const isCacheFile = filename.endsWith('.cache.ts') || filename.endsWith('.cache.tsx');
		const isIntegrationFile = filename.endsWith('.integration.ts') || filename.endsWith('.integration.tsx');
		if (!isServiceFile && !isActionFile && !isCacheFile && !isIntegrationFile) {
			return {};
		}

		const allowSyncWithoutResult = Boolean(context.options[0]?.allowSyncWithoutResult) || isIntegrationFile;
		const sourceCode = context.sourceCode;

		const checkFunction = (node, idNode) => {
			if (!isFunctionExpression(node) && node.type !== 'FunctionDeclaration') {
				return;
			}

			if (allowSyncWithoutResult && node.async !== true) {
				return;
			}

			if (!isResultTypeAnnotation(sourceCode, node.returnType?.typeAnnotation)) {
				context.report({ node: idNode ?? node, messageId: 'missingResultType' });
			}
		};

		return {
			ExportNamedDeclaration(node) {
				if (node.exportKind === 'type' || !node.declaration) {
					return;
				}

				if (node.declaration.type === 'FunctionDeclaration') {
					checkFunction(node.declaration, node.declaration.id ?? node.declaration);
					return;
				}

				for (const declarator of getExportedVariableDeclarators(node)) {
					checkFunction(declarator.init, declarator.id ?? declarator);
				}
			},
		};
	},
};

const safeResultErrors = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Forbid leaking infrastructure details into Result error messages.',
		},
		schema: [],
		messages: {
			unsafeResultError:
				'resultFail must use a stable, client-safe error message. Do not stringify or interpolate raw errors.',
		},
	},
	create(context) {
		const sourceCode = context.sourceCode;

		return {
			CallExpression(node) {
				if (!isResultFailCall(node)) {
					return;
				}

				const [errorArgument] = node.arguments;
				if (isUnsafeResultError(sourceCode, errorArgument)) {
					context.report({ node, messageId: 'unsafeResultError' });
				}
			},
		};
	},
};

const kebabCasePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const routeParamPattern = /^[A-Za-z][A-Za-z0-9]*$/;

const isKebabCase = (value) => kebabCasePattern.test(value);

const isRouteParamName = (value) => isKebabCase(value) || routeParamPattern.test(value);

const isAllowedDirectorySegment = (segment) => {
	if (isKebabCase(segment)) {
		return true;
	}

	const routeGroup = segment.match(/^\((.+)\)$/);
	if (routeGroup) {
		return isKebabCase(routeGroup[1]);
	}

	const parallelRoute = segment.match(/^@(.+)$/);
	if (parallelRoute) {
		return isKebabCase(parallelRoute[1]);
	}

	const privateFolder = segment.match(/^_(.+)$/);
	if (privateFolder) {
		return isKebabCase(privateFolder[1]);
	}

	const optionalCatchAll = segment.match(/^\[\[\.\.\.(.+)\]\]$/);
	if (optionalCatchAll) {
		return isRouteParamName(optionalCatchAll[1]);
	}

	const catchAll = segment.match(/^\[\.\.\.(.+)\]$/);
	if (catchAll) {
		return isRouteParamName(catchAll[1]);
	}

	const routeParam = segment.match(/^\[(.+)\]$/);
	if (routeParam) {
		return isRouteParamName(routeParam[1]);
	}

	// Next.js metadata route folders, for example src/app/robots.txt/route.ts.
	return /^[a-z0-9]+(-[a-z0-9]+)*\.[a-z0-9]+$/.test(segment);
};

const isAllowedSourceFilename = (filename) => isKebabCase(filename.split('.')[0]);

const srcRelativeSegments = (filename) => {
	const match = normalizePath(filename).match(/(?:^|\/)src\/(.*)$/);
	if (!match?.[1]) {
		return null;
	}

	return match[1].split('/').filter(Boolean);
};

const isIgnoredKebabPath = (filename) => {
	const normalized = normalizePath(filename);

	return normalized.includes('/src/generated/') || normalized.includes('/src/lib/database/migrations/');
};

const kebabCasePaths = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require kebab-case source file and directory names under src.',
		},
		schema: [],
		messages: {
			kebabCase:
				'Rename "{{name}}" to kebab-case. A dotted suffix such as ".service.ts" is allowed; the name before the first dot must be kebab-case.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		const segments = srcRelativeSegments(filename);

		return {
			Program(node) {
				if (!segments || isIgnoredKebabPath(filename)) {
					return;
				}

				segments.forEach((segment, index) => {
					const isFilename = index === segments.length - 1;
					const allowed = isFilename ? isAllowedSourceFilename(segment) : isAllowedDirectorySegment(segment);
					if (!allowed) {
						context.report({ node, messageId: 'kebabCase', data: { name: segment } });
					}
				});
			},
		};
	},
};

const filenameContract = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Restrict module and integration filenames to approved architecture suffixes.',
		},
		schema: [],
		messages: {
			invalidModuleFilename:
				'Module files must use an approved suffix: .actions, .service, .cache, .repository, .schemas, .permissions, .types, or .test.',
			invalidIntegrationFilename: 'Integration files must use an approved suffix: .integration or .test.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);

		return {
			Program(node) {
				if (filename.includes('/src/modules/') && !isAllowedModuleFilename(filename)) {
					context.report({ node, messageId: 'invalidModuleFilename' });
				}

				if (filename.includes('/src/integrations/') && !isAllowedIntegrationFilename(filename)) {
					context.report({ node, messageId: 'invalidIntegrationFilename' });
				}
			},
		};
	},
};

const noCrossModuleDeepImports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Forbid deep imports across module boundaries.',
		},
		schema: [],
		messages: {
			deepImport:
				'Cross-module imports may only target the owning module service or cache, or type-only .types/.schemas contracts.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		const currentModule = getModuleNameFromPath(filename);
		if (!currentModule) {
			return {};
		}

		const isAllowedCrossModuleTarget = (importedPath, isTypeOnly) => {
			if (
				importedPath.endsWith('.service') ||
				importedPath.endsWith('.service.ts') ||
				importedPath.endsWith('.cache') ||
				importedPath.endsWith('.cache.ts')
			) {
				return true;
			}

			if (!isTypeOnly) {
				return false;
			}

			return (
				importedPath.endsWith('.types') ||
				importedPath.endsWith('.types.ts') ||
				importedPath.endsWith('.schemas') ||
				importedPath.endsWith('.schemas.ts')
			);
		};

		return {
			ImportDeclaration(node) {
				const source = node.source.value;
				if (typeof source !== 'string') {
					return;
				}

				const isTypeOnly =
					node.importKind === 'type' || node.specifiers.every((specifier) => specifier.importKind === 'type');

				const absoluteMatch = source.match(/^@\/modules\/([^/]+)\/(.+)$/);
				if (absoluteMatch) {
					const [, importedModule, rest] = absoluteMatch;
					if (importedModule === currentModule) {
						return;
					}

					if (!isAllowedCrossModuleTarget(rest, isTypeOnly)) {
						context.report({ node, messageId: 'deepImport' });
					}

					return;
				}

				if (!source.startsWith('.')) {
					return;
				}

				const fromDir = path.posix.dirname(filename);
				const resolved = path.posix.normalize(`${fromDir}/${source}`);
				const resolvedModule = getModuleNameFromPath(`${resolved}/`);
				if (resolvedModule && resolvedModule !== currentModule) {
					context.report({ node, messageId: 'deepImport' });
				}
			},
		};
	},
};

const repositoryExportNaming = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require repository exports to use persistence-oriented verb prefixes.',
		},
		schema: [],
		messages: {
			invalidName: 'Exported repository functions must start with find, create, update, delete, remove, count, or group.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		if (!filename.endsWith('.repository.ts') && !filename.endsWith('.repository.tsx')) {
			return {};
		}

		const isValidName = (name) => /^(find|create|update|delete|remove|count|group)([A-Z].*)?$/.test(name);

		return {
			ExportNamedDeclaration(node) {
				if (node.exportKind === 'type' || !node.declaration) {
					return;
				}

				if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
					if (!isValidName(node.declaration.id.name)) {
						context.report({ node: node.declaration.id, messageId: 'invalidName' });
					}
					return;
				}

				for (const declarator of getExportedVariableDeclarators(node)) {
					if (declarator.id?.type !== 'Identifier') {
						continue;
					}

					if (!isFunctionExpression(declarator.init)) {
						continue;
					}

					if (!isValidName(declarator.id.name)) {
						context.report({ node: declarator.id, messageId: 'invalidName' });
					}
				}
			},
		};
	},
};

const actionUnknownParams = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require exported Server Action parameters to be typed as unknown or FormData.',
		},
		schema: [],
		messages: {
			untrustedParam: 'Exported Server Action parameters must be typed as unknown or FormData.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		if (!filename.endsWith('.actions.ts') && !filename.endsWith('.actions.tsx')) {
			return {};
		}

		const sourceCode = context.sourceCode;

		const checkFunction = (node) => {
			if (!isFunctionExpression(node) && node.type !== 'FunctionDeclaration') {
				return;
			}

			for (const param of node.params) {
				const typeNode = getParamTypeNode(param);
				if (!isUnknownOrFormDataType(sourceCode, typeNode)) {
					context.report({ node: param, messageId: 'untrustedParam' });
				}
			}
		};

		return {
			ExportNamedDeclaration(node) {
				if (node.exportKind === 'type' || !node.declaration) {
					return;
				}

				if (node.declaration.type === 'FunctionDeclaration') {
					checkFunction(node.declaration);
					return;
				}

				for (const declarator of getExportedVariableDeclarators(node)) {
					checkFunction(declarator.init);
				}
			},
		};
	},
};

const noServiceThrow = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Forbid throwing from services; use Result failures for expected errors.',
		},
		schema: [],
		messages: {
			noThrow: 'Services must return resultFail for expected failures instead of throwing.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		if (!filename.endsWith('.service.ts') && !filename.endsWith('.service.tsx')) {
			return {};
		}

		if (filename.includes('.test.')) {
			return {};
		}

		return {
			ThrowStatement(node) {
				context.report({ node, messageId: 'noThrow' });
			},
		};
	},
};

const typesFileNoRuntimeFunctions = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Forbid exported runtime functions from module type-contract files.',
		},
		schema: [],
		messages: {
			runtimeFunction:
				'Module .types files may only export shared types, view models, and inert constants; move runtime functions to the owning layer.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		if ((!filename.endsWith('.types.ts') && !filename.endsWith('.types.tsx')) || !filename.includes('/src/modules/')) {
			return {};
		}

		const sourceCode = context.sourceCode;
		const reportIdentifierIfFunction = (identifier) => {
			const variable = findVariable(sourceCode.getScope(identifier), identifier.name);
			const definition = variable?.defs.length === 1 ? variable.defs[0] : null;
			const functionNode =
				definition?.type === 'FunctionName'
					? definition.node
					: definition?.type === 'Variable'
						? definition.node.init
						: null;

			if (functionNode && (functionNode.type === 'FunctionDeclaration' || isFunctionExpression(functionNode))) {
				context.report({ node: identifier, messageId: 'runtimeFunction' });
			}
		};

		return {
			ExportDefaultDeclaration(node) {
				if (node.declaration.type === 'FunctionDeclaration' || isFunctionExpression(node.declaration)) {
					context.report({ node, messageId: 'runtimeFunction' });
				}
			},
			ExportNamedDeclaration(node) {
				if (node.exportKind === 'type') {
					return;
				}

				if (node.declaration?.type === 'FunctionDeclaration') {
					context.report({ node: node.declaration, messageId: 'runtimeFunction' });

					return;
				}

				for (const declarator of getExportedVariableDeclarators(node)) {
					if (isFunctionExpression(declarator.init)) {
						context.report({ node: declarator, messageId: 'runtimeFunction' });
					}
				}

				if (!node.source) {
					for (const specifier of node.specifiers) {
						if (specifier.exportKind !== 'type' && specifier.local.type === 'Identifier') {
							reportIdentifierIfFunction(specifier.local);
						}
					}
				}
			},
		};
	},
};

const prismaWriteMethods = new Set([
	'create',
	'createMany',
	'createManyAndReturn',
	'update',
	'updateMany',
	'updateManyAndReturn',
	'upsert',
	'delete',
	'deleteMany',
]);

const rawWriteMethods = new Set(['$executeRaw', '$executeRawUnsafe']);

const auditInternals = new Set(['runAuditedTransaction', 'insertAuditEvents']);

const auditedWrites = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require database writes to go through withAudit.',
		},
		schema: [
			{
				type: 'object',
				properties: {
					auditedModels: { type: 'array', items: { type: 'string' } },
					requireAuditedWrites: { type: 'boolean' },
				},
				additionalProperties: false,
			},
		],
		messages: {
			auditedModelWrite:
				"Writes to '{{model}}' must run inside withAudit: take an AuditedTransaction and write through getTransactionClient(transaction).",
			unauditedWrite:
				'Repository writes must run inside withAudit and use getTransactionClient(transaction). Technical writes that change no business entity may use unauditedWrite(reason, ...).',
			rawTransaction: 'Start write transactions with withAudit instead of $transaction.',
			auditEventWrite: 'Audit events are append-only and written by withAudit only.',
			auditInternalImport: '{{name}} is internal to src/lib/audit. Use withAudit.',
			transactionClientImport: 'Only repositories may unwrap an AuditedTransaction.',
		},
	},
	create(context) {
		const { auditedModels = [], requireAuditedWrites = false } = context.options[0] ?? {};
		const filename = normalizePath(context.filename);
		const isRepository = /\.repository\.tsx?$/.test(filename);
		const sourceCode = context.sourceCode;
		const prismaNames = new Set();
		const transactionClientNames = new Set();
		const unauditedWriteNames = new Set();

		const importedName = (specifier) =>
			specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier' ? specifier.imported.name : null;

		// 'audited': a getTransactionClient(...) client. 'unaudited': the shared
		// Prisma client or a $transaction callback client. 'unknown': anything
		// else, which this rule cannot judge and leaves alone.
		const classifyClient = (node, seen = new Set()) => {
			if (node?.type === 'CallExpression') {
				return node.callee.type === 'Identifier' && transactionClientNames.has(node.callee.name) ? 'audited' : 'unknown';
			}
			if (node?.type !== 'Identifier') {
				return 'unknown';
			}

			const variable = findVariable(sourceCode.getScope(node), node.name);
			const definition = variable?.defs.length === 1 ? variable.defs[0] : null;
			if (!variable || !definition || seen.has(variable)) {
				return 'unknown';
			}
			seen.add(variable);

			if (definition.type === 'ImportBinding') {
				return prismaNames.has(node.name) ? 'unaudited' : 'unknown';
			}
			if (definition.type === 'Variable' && definition.node.init) {
				return classifyClient(definition.node.init, seen);
			}
			if (definition.type === 'Parameter') {
				const call = definition.node.parent;
				const isTransactionCallback =
					call?.type === 'CallExpression' &&
					call.arguments.includes(definition.node) &&
					call.callee.type === 'MemberExpression' &&
					call.callee.property.type === 'Identifier' &&
					call.callee.property.name === '$transaction';

				return isTransactionCallback ? 'unaudited' : 'unknown';
			}

			return 'unknown';
		};

		const isInsideUnauditedWrite = (node) =>
			sourceCode
				.getAncestors(node)
				.some(
					(ancestor) =>
						ancestor.type === 'CallExpression' &&
						ancestor.callee.type === 'Identifier' &&
						unauditedWriteNames.has(ancestor.callee.name),
				);

		const checkRawWrite = (node, receiver) => {
			if (requireAuditedWrites && classifyClient(receiver) === 'unaudited' && !isInsideUnauditedWrite(node)) {
				context.report({ node, messageId: 'unauditedWrite' });
			}
		};

		return {
			ImportDeclaration(node) {
				const source = node.source.value;
				for (const specifier of node.specifiers) {
					const name = importedName(specifier);
					if (source === '@/lib/database/prisma' && name === 'prisma') {
						prismaNames.add(specifier.local.name);
					}
					if (source === '@/lib/database/unaudited-write' && name === 'unauditedWrite') {
						unauditedWriteNames.add(specifier.local.name);
					}
					if (source !== '@/lib/database/audited-transaction' || !name || specifier.importKind === 'type') {
						continue;
					}
					if (auditInternals.has(name)) {
						context.report({ node: specifier, messageId: 'auditInternalImport', data: { name } });
					}
					if (name === 'getTransactionClient') {
						if (isRepository) {
							transactionClientNames.add(specifier.local.name);
						} else {
							context.report({ node: specifier, messageId: 'transactionClientImport' });
						}
					}
				}
			},
			TaggedTemplateExpression(node) {
				const { tag } = node;
				if (
					tag.type === 'MemberExpression' &&
					tag.property.type === 'Identifier' &&
					rawWriteMethods.has(tag.property.name)
				) {
					checkRawWrite(node, tag.object);
				}
			},
			CallExpression(node) {
				const { callee } = node;
				if (callee.type !== 'MemberExpression' || callee.property.type !== 'Identifier') {
					return;
				}

				const method = callee.property.name;
				if (method === '$transaction') {
					if (requireAuditedWrites && classifyClient(callee.object) === 'unaudited' && !isInsideUnauditedWrite(node)) {
						context.report({ node, messageId: 'rawTransaction' });
					}

					return;
				}
				if (rawWriteMethods.has(method)) {
					checkRawWrite(node, callee.object);

					return;
				}
				if (
					!prismaWriteMethods.has(method) ||
					callee.object.type !== 'MemberExpression' ||
					callee.object.property.type !== 'Identifier'
				) {
					return;
				}

				const model = callee.object.property.name;
				const client = classifyClient(callee.object.object);
				if (client === 'unknown') {
					return;
				}
				if (model === 'auditEvent') {
					context.report({ node, messageId: 'auditEventWrite' });

					return;
				}
				if (client === 'audited') {
					return;
				}
				if (auditedModels.includes(model)) {
					context.report({ node, messageId: 'auditedModelWrite', data: { model } });

					return;
				}
				if (requireAuditedWrites && !isInsideUnauditedWrite(node)) {
					context.report({ node, messageId: 'unauditedWrite' });
				}
			},
		};
	},
};

const backendArchitecturePlugin = {
	meta: {
		name: 'backend-architecture',
		version: '1.1.0',
	},
	rules: {
		'action-file-contract': actionFileContract,
		'result-contract': resultContract,
		'safe-result-errors': safeResultErrors,
		'filename-contract': filenameContract,
		'kebab-case-paths': kebabCasePaths,
		'no-cross-module-deep-imports': noCrossModuleDeepImports,
		'repository-export-naming': repositoryExportNaming,
		'action-unknown-params': actionUnknownParams,
		'no-service-throw': noServiceThrow,
		'types-file-no-runtime-functions': typesFileNoRuntimeFunctions,
		'audited-writes': auditedWrites,
	},
};

export default backendArchitecturePlugin;
