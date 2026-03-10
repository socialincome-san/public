import { ServiceResult } from './base.types';

export const resultOk = <T>(data: T, status?: number): ServiceResult<T> => ({ success: true, data, status });

export const resultFail = <T = never>(error: string, status?: number): ServiceResult<T> => ({
	success: false,
	error,
	status,
});
