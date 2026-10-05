type ResultFailure = {
	success: false;
	error: string;
	status?: number;
};

export type Result<T, TFailure extends ResultFailure = ResultFailure> =
	{ success: true; data: T; status?: number } | TFailure;

export const resultOk = <T>(data: T, status?: number): Result<T> => ({
	success: true,
	data,
	status,
});

export const resultFail = <T = never>(error: string, status?: number): Result<T> => ({
	success: false,
	error,
	status,
});
