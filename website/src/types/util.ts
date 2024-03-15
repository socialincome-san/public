/**
 * Extract type without array-typing.
 * e.g. MyType[] -> MyType
 */
type ArrayElement<ArrayType extends readonly unknown[] | undefined> = ArrayType extends readonly (infer ElementType)[]
	? ElementType
	: never;
