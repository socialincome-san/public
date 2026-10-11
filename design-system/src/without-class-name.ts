// Distributes over unions so discriminated props (for example Radix single/multiple modes) stay intact.
export type WithoutClassName<T> = T extends unknown ? Omit<T, 'className'> : never;
