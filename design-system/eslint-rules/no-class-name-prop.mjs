const isPascalCase = (name) => /^[A-Z]/.test(name);

const isFunctionNode = (node) => node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression';

const isWrapperCall = (node) => {
	if (node?.type !== 'CallExpression') {
		return false;
	}

	const { callee } = node;
	const calleeName = callee.type === 'MemberExpression' ? callee.property.name : callee.name;
	return calleeName === 'forwardRef' || calleeName === 'memo';
};

const unwrapComponentFunction = (node) => {
	if (isFunctionNode(node)) {
		return node;
	}

	if (isWrapperCall(node)) {
		return unwrapComponentFunction(node.arguments[0]);
	}

	return null;
};

// className itself and escape hatches such as wrapperClassName or imageClassName
const isClassNameProp = (name) => name === 'className' || name.endsWith('ClassName');

const findClassNameProp = (checker, type) =>
	(type.isUnion() ? type.types : [type])
		.flatMap((member) => checker.getPropertiesOfType(member))
		.find((property) => isClassNameProp(property.getName()));

const noClassNameProp = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow components that accept className (or *ClassName). Components own their styling and expose named variants instead.',
		},
		schema: [],
		messages: {
			classNameProp:
				'"{{name}}" must not accept {{prop}}. Expose a named prop (for example size="s" | "m" | "l" or variant="negative") and map it to classes inside the component. Use Omit<…, "className"> when spreading third-party or HTML props.',
		},
	},
	create: (context) => {
		const services = context.sourceCode.parserServices;
		if (!services?.program) {
			return {};
		}

		const checker = services.program.getTypeChecker();

		const checkComponent = (name, fn) => {
			const [propsParam] = fn?.params ?? [];
			if (!propsParam) {
				return;
			}

			const propsType = checker.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(propsParam));
			const classNameProp = findClassNameProp(checker, propsType);
			if (classNameProp) {
				context.report({ node: propsParam, messageId: 'classNameProp', data: { name, prop: classNameProp.getName() } });
			}
		};

		return {
			VariableDeclarator: (node) => {
				if (node.id.type === 'Identifier' && isPascalCase(node.id.name)) {
					checkComponent(node.id.name, unwrapComponentFunction(node.init));
				}
			},
			FunctionDeclaration: (node) => {
				if (node.id && isPascalCase(node.id.name)) {
					checkComponent(node.id.name, node);
				}
			},
		};
	},
};

export default {
	rules: {
		'no-class-name-prop': noClassNameProp,
	},
};
