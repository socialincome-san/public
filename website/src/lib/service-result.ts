export type ServiceResult<T> =
	{ success: true; data: T; status?: number } | { success: false; error: string; status?: number };

export const resultOk = <T>(data: T, status?: number): ServiceResult<T> => ({
	success: true,
	data,
	status,
});

export const resultFail = <T = never>(error: string, status?: number): ServiceResult<T> => ({
	success: false,
	error,
	status,
});
