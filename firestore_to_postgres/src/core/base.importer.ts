export abstract class BaseImporter<T> {
	abstract import(data: T[]): Promise<number>;
}
