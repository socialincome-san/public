export type EntityValues<M> = M;

export interface Entity<M> {
	/**
	 * ID of the entity
	 */
	id: string;
	/**
	 * A string representing the path of the referenced document (relative
	 * to the root of the database).
	 */
	path: string;
	/**
	 * Current values
	 */
	values: EntityValues<M>;
}
