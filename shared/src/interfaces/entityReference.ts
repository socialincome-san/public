export declare class EntityReference {
  /**
   * ID of the entity
   */
  readonly id: string;
  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  readonly path: string;
  constructor(id: string, path: string);
  get pathWithId(): string;
}
