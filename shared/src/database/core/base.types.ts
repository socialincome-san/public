export type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

export type PaginationOptions = {
	take?: number;
	skip?: number;
};
