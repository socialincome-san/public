const colorUtilities =
	'(?:bg|text|border(?:-[trblxy])?|ring(?:-offset)?|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow|inset-shadow|drop-shadow)';
const tailwindPalette =
	'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)';

const checks = [
	{
		pattern: new RegExp(`^${colorUtilities}-${tailwindPalette}-\\d{2,3}(?:/\\d+)?$`),
		foundation: 'Colors',
	},
	{
		// Literal colors only: values built from tokens, such as [hsl(var(--primary))], are fine
		pattern: new RegExp(`^${colorUtilities}-\\[(?:#|rgba?\\(|hsla?\\(\\s*\\d|oklch\\(|color\\()`),
		foundation: 'Colors',
	},
	{
		// Relative sizes such as text-[0.45em] are fine
		pattern: /^text-\[\d*\.?\d+(?:px|rem)\]$/,
		foundation: 'Typography',
	},
	{
		pattern: /^rounded(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee))?-\[/,
		foundation: 'Radius',
	},
	{
		pattern: /^(?:shadow|inset-shadow|drop-shadow|text-shadow)-\[/,
		foundation: 'Shadows',
	},
];

// The utility is everything after the last variant separator outside brackets, e.g. md:hover:!bg-[#fff] -> bg-[#fff]
const toUtility = (className) => {
	let depth = 0;
	let lastSeparator = -1;
	[...className].forEach((character, index) => {
		if (character === '[') {
			depth += 1;
		} else if (character === ']') {
			depth -= 1;
		} else if (character === ':' && depth === 0) {
			lastSeparator = index;
		}
	});

	return className
		.slice(lastSeparator + 1)
		.replace(/^!|!$/g, '')
		.replace(/^-/, '');
};

const noArbitraryDesignValues = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow Tailwind default palette colors and arbitrary colors, font sizes, radii and shadows. Use design-system tokens instead.',
		},
		schema: [],
		messages: {
			offToken:
				'"{{className}}" bypasses the design tokens. Use a token from Storybook › Foundations › {{foundation}}, or add one to design-system/src/styles.',
		},
	},
	create: (context) => {
		const checkText = (node, text) => {
			for (const className of text.split(/\s+/)) {
				const utility = toUtility(className);
				const violation = checks.find(({ pattern }) => pattern.test(utility));
				if (violation) {
					context.report({ node, messageId: 'offToken', data: { className, foundation: violation.foundation } });
				}
			}
		};

		return {
			Literal: (node) => {
				if (typeof node.value === 'string') {
					checkText(node, node.value);
				}
			},
			TemplateElement: (node) => {
				checkText(node, node.value.cooked ?? node.value.raw);
			},
		};
	},
};

export default {
	rules: {
		'no-arbitrary-design-values': noArbitraryDesignValues,
	},
};
