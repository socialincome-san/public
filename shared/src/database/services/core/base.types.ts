export type ServiceResult<T> =
	| { success: true; data: T; status?: number }
	| { success: false; error: string; status?: number };
