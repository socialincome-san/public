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

const isServiceResultTypeAnnotation = (sourceCode, typeNode) => {
	const text = typeNodeText(sourceCode, typeNode);
	return /^ServiceResult<.+>$/.test(text) || /^Promise<ServiceResult<.+>>$/.test(text);
};

const containsJsonStringify = (node) => {
	if (!node) {
		return false;
	}

	if (
		node.type === 'CallExpression' &&
		node.callee?.type === 'MemberExpression' &&
		node.callee.object?.type === 'Identifier' &&
		node.callee.object.name === 'JSON' &&
		node.callee.property?.type === 'Identifier' &&
		node.callee.property.name === 'stringify'
	) {
		return true;
	}

	if (node.type === 'TemplateLiteral') {
		return node.expressions.some((expression) => containsJsonStringify(expression));
	}

	if (node.type === 'BinaryExpression') {
		return containsJsonStringify(node.left) || containsJsonStringify(node.right);
	}

	if (node.type === 'ConditionalExpression') {
		return containsJsonStringify(node.consequent) || containsJsonStringify(node.alternate);
	}

	return false;
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

const serviceResultContract = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require exported service and integration functions to return ServiceResult.',
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
				'Exported functions in services and integrations must declare ServiceResult<T> or Promise<ServiceResult<T>> return types.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		const isServiceFile = filename.endsWith('.service.ts') || filename.endsWith('.service.tsx');
		const isIntegrationFile = filename.endsWith('.integration.ts') || filename.endsWith('.integration.tsx');
		if (!isServiceFile && !isIntegrationFile) {
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

			if (!isServiceResultTypeAnnotation(sourceCode, node.returnType?.typeAnnotation)) {
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
			description: 'Forbid leaking infrastructure details into ServiceResult error messages.',
		},
		schema: [],
		messages: {
			unsafeResultError:
				'resultFail must use a stable, client-safe error message. Do not stringify or interpolate raw errors.',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (!isResultFailCall(node)) {
					return;
				}

				const [errorArgument] = node.arguments;
				if (containsJsonStringify(errorArgument)) {
					context.report({ node, messageId: 'unsafeResultError' });
				}
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
				'Module files must use an approved suffix: .actions, .service, .repository, .schemas, .permissions, .types, or .test.',
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
			deepImport: 'Cross-module imports may only target the owning module service, or type-only .types/.schemas contracts.',
		},
	},
	create(context) {
		const filename = normalizePath(context.filename);
		const currentModule = getModuleNameFromPath(filename);
		if (!currentModule) {
			return {};
		}

		const isAllowedCrossModuleTarget = (importedPath, isTypeOnly) => {
			if (importedPath.endsWith('.service') || importedPath.endsWith('.service.ts')) {
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
			description: 'Forbid throwing from services; use ServiceResult failures for expected errors.',
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

const backendArchitecturePlugin = {
	meta: {
		name: 'backend-architecture',
		version: '1.1.0',
	},
	rules: {
		'action-file-contract': actionFileContract,
		'service-result-contract': serviceResultContract,
		'safe-result-errors': safeResultErrors,
		'filename-contract': filenameContract,
		'no-cross-module-deep-imports': noCrossModuleDeepImports,
		'repository-export-naming': repositoryExportNaming,
		'action-unknown-params': actionUnknownParams,
		'no-service-throw': noServiceThrow,
	},
};

export default backendArchitecturePlugin;
