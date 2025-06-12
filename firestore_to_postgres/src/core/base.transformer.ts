export abstract class BaseTransformer<Input, Output> {
	abstract transform(input: Input[]): Promise<Output[]>;
}
