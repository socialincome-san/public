export type Result<T> = { success: true; data: T } | { success: false; error: string };

export const ok = <T>(data: T): Result<T> => ({ success: true, data });

export const fail = <T = never>(error: string): Result<T> => ({ success: false, error });
