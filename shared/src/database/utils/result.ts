export type Result<T> = { success: true; data: T } | { success: false; error: string };

export const resultOk = <T>(data: T): Result<T> => ({ success: true, data });

export const resultFail = <T = never>(error: string): Result<T> => ({ success: false, error });
