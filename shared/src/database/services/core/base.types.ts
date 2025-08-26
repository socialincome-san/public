export type ServiceResult<T> =
	| { success: true; data: T; status?: number }
	| { success: false; error: string; status?: number };

export type PaginationOptions = {
	take?: number;
	skip?: number;
};
