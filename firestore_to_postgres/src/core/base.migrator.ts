export abstract class BaseMigrator {
	abstract migrate(): Promise<number>;
}
